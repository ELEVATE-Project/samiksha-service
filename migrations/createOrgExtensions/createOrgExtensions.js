// Load environment variables from a specific .env file
require('dotenv').config({ path: '../../.env' });

// Import Kafka client configuration using the KAFKA_URL from environment
const kafkaClient = require('../../config/kafkaConfig')({host: process.env.KAFKA_URL})

// Import axios for HTTP requests
const axios = require('axios');

// Import readline for interactive console input
const readline = require('readline');

// Import MongoDB client
const { MongoClient } = require('mongodb')

// Construct MongoDB connection URL using environment variables
const MONGODB_URL = `${process.env.MONGODB_URL}/${process.env.DB}`

// Create a MongoDB client instance
const dbClient = new MongoClient(MONGODB_URL, { useUnifiedTopology: true })

// Parse command-line arguments
const args = process.argv.slice(2);

// Immediately invoked async function to perform service health check and run migration
(async function healthCheck(){
    // Array of service health check URLs
    const healthCheckUrls = [
        process.env.INTERFACE_SERVICE_URL + process.env.APPLICATION_BASE_URL + 'health',
        process.env.USER_SERVICE_URL + '/health'
    ]

    // Create an array of axios GET requests with a 5-second timeout
    const requests = healthCheckUrls.map(url => axios.get(url, { timeout: 5000}))

    // Wait for all requests to settle (fulfilled or rejected)
    const responses = await Promise.allSettled(requests)

    let healthCheckFlag = true

    // Iterate over each response and log errors if any
    responses.forEach((response, i) => {
        if (response.status === 'rejected') {
            console.error(`${healthCheckUrls[i]} →`, response.reason.message)
            healthCheckFlag = false
        }
        else if(response.value.data.result.healthy == false){
            console.error(`Health Check failed for ${response.value.data.result.name} service!!`)
            healthCheckFlag = false
        }
    })
    
    // Exit script if any health check failed
    if(!healthCheckFlag){
        console.error('Health Check Failed!! Exiting the script')
        process.exit(0)
    }

    // Proceed to run the migration if health checks passed
    await runMigration()
})().catch(err => console.error('Top-level error', err));

// Function to fetch tenant list from user service or from command-line argument
async function fetchTenantList() {
    try{
        const tenant = Array.isArray(args) && args.length > 0 ? args[0] : null
        let tenantList = []

        // If no tenant specified via command-line, fetch all tenants from user service
        if(!tenant){
            const tenantListUrl = process.env.USER_SERVICE_URL + '/v1/tenant/list'
            const headers = { internal_access_token : process.env.INTERNAL_ACCESS_TOKEN }            

            const response = await axios.get(tenantListUrl , {headers})

            if(!response || response.data?.responseCode != 'OK'){
                throw new Error('Tenant list fetch unsuccessful!!')
            }

            // Extract tenant codes from response
            tenantList = response.data.result.map(tenant => tenant.code)
        }
        else tenantList = [tenant] // Single tenant specified via command-line

        return tenantList
    }
    catch(error){
        throw error
    }
}

// Helper function to ask a question in the console and get user input
function askQuestion(query) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      rl.question(query, answer => {
        rl.close();
        resolve(answer.trim());
      });
    });
}

// Fetch organization data for each tenant
async function fetchOrgsData(tenantList) {
    try{
        let orgsByTenant = {}

        // Prepare requests for each tenant
        const requests = tenantList.map(tenant => {
            let url = process.env.USER_SERVICE_URL + '/v1/organization/list' + `?tenant_code=${tenant}`
            let headers = { internal_access_token : process.env.INTERNAL_ACCESS_TOKEN }
            return axios.get(url, {headers})
        })

        // Wait for all requests to settle
        const responses = await Promise.allSettled(requests)

        // Process responses for each tenant
        responses.forEach(async (response, i) => {
            if((response.status === 'rejected') || !(response.value) || !(response.value.data.responseCode == 'OK')){
                // Ask user whether to continue if fetching org list failed
                const answer = await askQuestion(`Org list fetch for ${tenantList[i]} failed. Continue anyway? (y/N): `);              
                if (/^y(es)?$/i.test(answer)) {
                    console.log('Stopping script...');
                    process.exit(1);
                }
            }else{
                response = response.value.data.result
                orgsByTenant[`${tenantList[i]}`] = response.map((org) => org.code)
            }
        })

        return orgsByTenant
    }
    catch(error){
        throw error
    }
}

// Function to push messages to Kafka topic
const pushMessageToKafka = async (payload) => {
    console.log('-------Kafka producer log starts here------------------');
    console.log('Topic Name: ', payload[0].topic);
    console.log('Message: ', JSON.stringify(payload));
    console.log('-------Kafka producer log ends here------------------');

    try {
        // Wrap Kafka producer send in a promise
        const data = await new Promise((resolve, reject) => {
            kafkaClient.kafkaProducer.send(payload, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        return {
            status: messageConstants.common.SUCCESS,
            message: `Kafka push to topic ${payload[0].topic} successful with number - ${data[payload[0].topic][0]}`
        };
    } catch (err) {
        return {
            status: 'failed',
            message: `Kafka push to topic ${payload[0].topic} failed: ${err}`
        };
    }
};

async function updateProjectCategories(DB) {
	try {
		await DB.collection('projectCategories').updateMany({}, [
			{
				$set: {
					visibleToOrganizations: ['$orgId'],
				},
			},
		])
		console.log('Project Categories collection updated successfully...')
		return
	} catch (error) {
		throw error
	}
}

// Main function to run migration
async function runMigration() {
    try{
        // Fetch tenant list
        const tenantList = await fetchTenantList()

        // Fetch organizations for each tenant
        const orgsByTenant = await fetchOrgsData(tenantList)

        // Connect to MongoDB
        await dbClient.connect()
        const DB = dbClient.db()

        // Base orgExtension object for Kafka events
        let orgExtension = {
            "entity": "organization",
            "eventType": "create",
            "code": "<org_code>",
            "tenant_code": "<tenant_code>",
            "status": "ACTIVE",
            "deleted": false
        }

        // Iterate over each tenant and its organizations
        for (const [tenant, orgs] of Object.entries(orgsByTenant)){
            // Fetch existing organization extensions from DB
            const existingDocs = await DB.collection('organizationExtension')
                .find({ tenantId: tenant, orgId: { $in: orgs } })
                .project({ orgId: 1, _id: 0 })
                .toArray();

            orgExtension["tenant_code"] = tenant
            const existingOrgIds = new Set(existingDocs.map(d => d.orgId));
            let messages = []

            // Prepare Kafka messages only for new orgs
            for (const org of orgs) {
                if (!existingOrgIds.has(org)) {
                    messages.push({ ...orgExtension, tenant_code: tenant, code: org });
                }
            }

            // Push Kafka messages if there are any new orgs
            if (messages.length > 0) {
                const payload = [
                    {
                        topic: process.env.ORG_UPDATES_TOPIC,
                        messages: messages.map(m => JSON.stringify(m))
                    }
                ];
        
                await pushMessageToKafka(payload);
                console.log(`Kafka event pushed for tenant ${tenant} with ${messages.length} org(s).`);
            }         
        }

		await updateProjectCategories(DB)

        // Close MongoDB connection and exit
        await dbClient.close();
        process.exit(0);
    }
    catch (error){
        console.error(error?.message || error);
        console.error('Exiting the script!!');
        process.exit(1);
    }
}