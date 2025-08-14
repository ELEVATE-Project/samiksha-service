const kafkaCommunicationsOnOff =
  !process.env.KAFKA_COMMUNICATIONS_ON_OFF || process.env.KAFKA_COMMUNICATIONS_ON_OFF != 'OFF' ? 'ON' : 'OFF';
const completedObservationSubmissionKafkaTopic =
  process.env.COMPLETED_OBSERVATION_SUBMISSION_TOPIC && process.env.COMPLETED_OBSERVATION_SUBMISSION_TOPIC != 'OFF'
    ? process.env.COMPLETED_OBSERVATION_SUBMISSION_TOPIC
    : 'elevate_observations_dev';
const completedSubmissionKafkaTopic =
  process.env.COMPLETED_SUBMISSION_TOPIC && process.env.COMPLETED_SUBMISSION_TOPIC != 'OFF'
    ? process.env.COMPLETED_SUBMISSION_TOPIC
    : 'elevate_submissions_dev';
const inCompleteObservationSubmissionKafkaTopic =
  process.env.INCOMPLETE_OBSERVATION_SUBMISSION_TOPIC && process.env.INCOMPLETE_OBSERVATION_SUBMISSION_TOPIC != 'OFF'
    ? process.env.INCOMPLETE_OBSERVATION_SUBMISSION_TOPIC
    : 'elevate_incomplete_observations_dev';
const inCompleteSubmissionKafkaTopic =
  process.env.INCOMPLETE_SUBMISSION_TOPIC && process.env.INCOMPLETE_SUBMISSION_TOPIC != 'OFF'
    ? process.env.INCOMPLETE_SUBMISSION_TOPIC
    : 'elevate_incomplete_submissions_dev';
const submissionRatingQueueKafkaTopic =
  process.env.SUBMISSION_RATING_QUEUE_TOPIC && process.env.SUBMISSION_RATING_QUEUE_TOPIC != 'OFF'
    ? process.env.SUBMISSION_RATING_QUEUE_TOPIC
    : 'elevate_submissions_rating_dev';
const notificationsKafkaTopic =
  process.env.NOTIFICATIONS_TOPIC && process.env.NOTIFICATIONS_TOPIC != 'OFF'
    ? process.env.NOTIFICATIONS_TOPIC
    : 'elevate_notifications_dev';
const completedSurveySubmissionKafkaTopic =
  process.env.COMPLETED_SURVEY_SUBMISSION_TOPIC && process.env.COMPLETED_SURVEY_SUBMISSION_TOPIC != 'OFF'
    ? process.env.COMPLETED_SURVEY_SUBMISSION_TOPIC
    : 'elevate_surveys_raw';
const inCompleteSurveySubmissionKafkaTopic =
  process.env.INCOMPLETE_SURVEY_SUBMISSION_TOPIC && process.env.INCOMPLETE_SURVEY_SUBMISSION_TOPIC != 'OFF'
    ? process.env.INCOMPLETE_SURVEY_SUBMISSION_TOPIC
    : 'elevate_incomplete_surveys_raw';
const programOperationTopic=
    process.env.PROGRAM_USER_MAPPING_TOPIC && process.env.PROGRAM_USER_MAPPING_TOPIC != 'OFF'
      ? process.env.PROGRAM_USER_MAPPING_TOPIC
      : 'elevate_program_operation_dev';

const improvementProjectSubmissionTopic = process.env.IMPROVEMENT_PROJECT_SUBMISSION_TOPIC 

const pushDeletedResourceTopic =
	process.env.RESOURCE_DELETION_TOPIC && process.env.RESOURCE_DELETION_TOPIC != 'OFF'
		? process.env.RESOURCE_DELETION_TOPIC
		: 'resource_deletion_topic'

const userCoursesTopic = process.env.USER_COURSES_TOPIC
const pushCompletedObservationSubmissionToKafka = function (message) {
  return new Promise(async (resolve, reject) => {
    try {
      let kafkaPushStatus = await pushMessageToKafka([
        {
          topic: completedObservationSubmissionKafkaTopic,
          messages: JSON.stringify(message),
        },
      ]);

      return resolve(kafkaPushStatus);
    } catch (error) {
      return reject(error);
    }
  });
};

const pushCompletedSubmissionToKafka = function (message) {
  return new Promise(async (resolve, reject) => {
    try {
      let kafkaPushStatus = await pushMessageToKafka([
        {
          topic: completedSubmissionKafkaTopic,
          messages: JSON.stringify(message),
        },
      ]);

      return resolve(kafkaPushStatus);
    } catch (error) {
      return reject(error);
    }
  });
};

const pushInCompleteObservationSubmissionToKafka = function (message) {
  return new Promise(async (resolve, reject) => {
    try {
      let kafkaPushStatus = await pushMessageToKafka([
        {
          topic: inCompleteObservationSubmissionKafkaTopic,
          messages: JSON.stringify(message),
        },
      ]);

      return resolve(kafkaPushStatus);
    } catch (error) {
      return reject(error);
    }
  });
};

const pushInCompleteSubmissionToKafka = function (message) {
  return new Promise(async (resolve, reject) => {
    try {
      let kafkaPushStatus = await pushMessageToKafka([
        {
          topic: inCompleteSubmissionKafkaTopic,
          messages: JSON.stringify(message),
        },
      ]);

      return resolve(kafkaPushStatus);
    } catch (error) {
      return reject(error);
    }
  });
};

const pushSubmissionToKafkaQueueForRating = function (message) {
  return new Promise(async (resolve, reject) => {
    try {
      let kafkaPushStatus = await pushMessageToKafka([
        {
          topic: submissionRatingQueueKafkaTopic,
          messages: JSON.stringify(message),
        },
      ]);

      return resolve(kafkaPushStatus);
    } catch (error) {
      return reject(error);
    }
  });
};

const pushObservationSubmissionToKafkaQueueForRating = function (message) {
  return new Promise(async (resolve, reject) => {
    try {
      let kafkaPushStatus = await pushMessageToKafka([
        {
          topic: submissionRatingQueueKafkaTopic,
          messages: JSON.stringify(message),
        },
      ]);

      return resolve(kafkaPushStatus);
    } catch (error) {
      return reject(error);
    }
  });
};

const pushUserMappingNotificationToKafka = function (message) {
  return new Promise(async (resolve, reject) => {
    try {
      let kafkaPushStatus = await pushMessageToKafka([
        {
          topic: notificationsKafkaTopic,
          messages: JSON.stringify(message),
        },
      ]);

      return resolve(kafkaPushStatus);
    } catch (error) {
      return reject(error);
    }
  });
};

const pushCompletedSurveySubmissionToKafka = function (message) {
  return new Promise(async (resolve, reject) => {
    try {
      let kafkaPushStatus = await pushMessageToKafka([
        {
          topic: completedSurveySubmissionKafkaTopic,
          messages: JSON.stringify(message),
        },
      ]);

      return resolve(kafkaPushStatus);
    } catch (error) {
      return reject(error);
    }
  });
};

const pushInCompleteSurveySubmissionToKafka = function (message) {
  return new Promise(async (resolve, reject) => {
    try {
      let kafkaPushStatus = await pushMessageToKafka([
        {
          topic: inCompleteSurveySubmissionKafkaTopic,
          messages: JSON.stringify(message),
        },
      ]);

      return resolve(kafkaPushStatus);
    } catch (error) {
      return reject(error);
    }
  });
};

 /**
   * Push observation and survey submission to improvement project service.
   * @method
   * @name pushSubmissionToProjectService
   * @param {String} message  -   submission document.
   * @returns {JSON} kafkaPushStatus- consists of kafka message whether it is pushed for reporting
   * or not.
   */

const pushSubmissionToProjectService = function (message) {
  return new Promise(async (resolve, reject) => {
    try {
      let kafkaPushStatus = await pushMessageToKafka([
        {
          topic: improvementProjectSubmissionTopic,
          messages: JSON.stringify(message),
        },
      ]);

      return resolve(kafkaPushStatus);
    } catch (error) {
      return reject(error);
    }
  });
};

const pushMessageToKafka = function (payload) {
  return new Promise((resolve, reject) => {
    if (kafkaCommunicationsOnOff != 'ON') {
      throw reject('Kafka configuration is not done');
    }

    kafkaClient.kafkaProducer.send(payload, (err, data) => {
      if (err) {
        return reject('Kafka push to topic ' + payload[0].topic + ' failed.');
      } else {
        return resolve(data);
      }
    });
  })
    .then((result) => {
      if (result[payload[0].topic][0] > 0) {
        return {
          status: 'success',
          message:
            'Kafka push to topic ' + payload[0].topic + ' successful with number - ' + result[payload[0].topic][0],
        };
      }
    })
    .catch((err) => {
      return {
        status: 'failed',
        message: err,
      };
    });
};

/**
 * Push program operation event to Kafka.
 * @function
 * @name pushProgramOperationEvent
 * @param {Object} message - The message payload to be pushed to Kafka.
 * @returns {Promise<Object>} Kafka push status response.
 */
const pushProgramOperationEvent = function (message) {
  return new Promise(async (resolve, reject) => {
    try {
      let kafkaPushStatus = await pushMessageToKafka([
        {
          topic: programOperationTopic,
          messages: JSON.stringify(message),
        },
      ]);

      return resolve(kafkaPushStatus);
    } catch (error) {
      return reject(error);
    }
  });
};

/**
 * Push userCourses event to Kafka.
 * @function
 * @name pushUserCoursesToKafka
 * @param {Object} message - The message payload to be pushed to Kafka.
 * @returns {Promise<Object>} Kafka push status response.
 */
const pushUserCoursesToKafka= function (message) {
  return new Promise(async (resolve, reject) => {
    try {
      let kafkaPushStatus = await pushMessageToKafka([
        {
          topic: userCoursesTopic,
          messages: JSON.stringify(message),
        },
      ]);

      return resolve(kafkaPushStatus);
    } catch (error) {
      return reject(error);
    }
  });
};



/**
 * Push resource deleted data to kafka.
 * @function
 * @name pushResourceDeleteKafkaEvent
 * @param {Object} message - Message data.
 */

const pushResourceDeleteKafkaEvent = function (message) {
	return new Promise(async (resolve, reject) => {
		try {			
			let kafkaPushStatus = await pushMessageToKafka([
				{
					topic: pushDeletedResourceTopic,
					messages: JSON.stringify(message),
				},
			])

			return resolve(kafkaPushStatus)
		} catch (error) {
			return reject(error)
		}
	})
}


module.exports = {
  pushCompletedSubmissionToKafka: pushCompletedSubmissionToKafka,
  pushCompletedObservationSubmissionToKafka: pushCompletedObservationSubmissionToKafka,
  pushUserMappingNotificationToKafka: pushUserMappingNotificationToKafka,
  pushSubmissionToKafkaQueueForRating: pushSubmissionToKafkaQueueForRating,
  pushObservationSubmissionToKafkaQueueForRating: pushObservationSubmissionToKafkaQueueForRating,
  pushInCompleteSubmissionToKafka: pushInCompleteSubmissionToKafka,
  pushInCompleteObservationSubmissionToKafka: pushInCompleteObservationSubmissionToKafka,
  pushCompletedSurveySubmissionToKafka: pushCompletedSurveySubmissionToKafka,
  pushInCompleteSurveySubmissionToKafka: pushInCompleteSurveySubmissionToKafka,
  pushProgramOperationEvent:pushProgramOperationEvent,
  pushSubmissionToProjectService: pushSubmissionToProjectService,
  pushResourceDeleteKafkaEvent:pushResourceDeleteKafkaEvent,
  pushUserCoursesToKafka:pushUserCoursesToKafka
};
