import requests
import argparse
import json
import os
from configparser import ConfigParser
from fpdf import FPDF
import time


# Load configuration
config = ConfigParser()
config.read('common_config/config.ini')

# PDF generator
from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 16)
        self.set_text_color(40, 40, 40)
        self.cell(0, 10, 'Elevate Platform - Service Health Report', ln=True, align='C')
        self.set_font('Arial', '', 10)
        self.cell(0, 10, 'Auto-generated report of microservice health checks', ln=True, align='C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

    def chapter(self, service_name, url, status, checks):
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(230, 230, 250)
        self.set_text_color(0)
        self.cell(0, 10, f"{service_name}", ln=True, fill=True)
        self.set_font('Arial', '', 11)
        self.set_text_color(80)
        self.multi_cell(0, 8, f"URL: {url}")
        self.multi_cell(0, 8, f"Overall Status: {status}")
        self.ln(1)

        # Table Headers
        self.set_fill_color(100, 149, 237)  # cornflower blue
        self.set_text_color(255)
        self.set_font('Arial', 'B', 11)
        self.cell(80, 8, 'Check Name', border=1, fill=True)
        self.cell(40, 8, 'Status', border=1, fill=True)
        self.cell(70, 8, 'Error Message', border=1, fill=True)
        self.ln()

        # Table Rows
        self.set_font('Arial', '', 10)
        for check in checks or [{"name": "No checks available", "healthy": None, "errMsg": ""}]:
            check_name = check.get("name", "Unknown")
            healthy = check.get("healthy", None)
            err_msg = check.get("errMsg", "")

            # Status and color
            if healthy is True:
                status_text = "Healthy"
                self.set_fill_color(144, 238, 144)  # light green
            elif healthy is False:
                status_text = "Unhealthy"
                self.set_fill_color(255, 99, 71)  # tomato red
            else:
                status_text = status
                self.set_fill_color(255, 99, 71)  # orange

            self.set_text_color(0)
            self.cell(80, 8, check_name, border=1)
            self.cell(40, 8, status_text, border=1, fill=True)
            self.cell(70, 8, err_msg[:40] + ("..." if len(err_msg) > 40 else ""), border=1)
            self.ln()

        self.ln(3)

def fetch_health_data(env):
    services = ['entity', 'project', 'survey', 'user', 'mentoring']
    base_url = config.get(env, 'entityHost')
    result_list = []

    for service in services:
        url = f"{base_url}{config.get(env, f'{service}Health')}"
        try:
            print(f"⏳ Checking {service.upper()} at {url}")
            res = requests.get(url, timeout=10)
            print(res.text)
            if res.status_code == 200:
                data = res.json()
                result_list.append({
                    'name': data['result'].get('name', service),
                    'url': url,
                    'status': 'Healthy' if data['result']['healthy'] else 'Unhealthy',
                    'checks': data['result'].get('checks', [])
                })
            else:
                result_list.append({
                    'name': service,
                    'url': url,
                    'status': f"Failed with status {res.status_code}",
                    'checks': []
                })
        except requests.exceptions.Timeout:
            print(f"❌ Timeout for {url}")
            result_list.append({
                'name': service,
                'url': url,
                'status': "Timeout",
                'checks': []
            })
        except requests.exceptions.RequestException as e:
            print(f"❌ Error while connecting to {url}: {e}")
            result_list.append({
                'name': service,
                'url': url,
                'status': f"Connection error: {str(e)}",
                'checks': []
            })

        # Sleep between requests to avoid server overload
        time.sleep(1)

    return result_list


def generate_pdf(data, filename='health_check_report.pdf'):
    pdf = PDF()
    pdf.add_page()

    for item in data:
        pdf.chapter(
            service_name=item['name'],
            url=item['url'],
            status=item['status'],
            checks=item['checks']
        )

    pdf.output(filename)
    print(f"✅ PDF report generated successfully: {filename}")

# Entry point
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--env", required=True, help="Environment section from config (e.g., DEV, QA, PROD)")
    args = parser.parse_args()

    print(config.sections(),"line no 86")
    if args.env not in config.sections():
        print(f"❌ Invalid environment: {args.env}")
        exit(1)

    print(f"🔍 Checking service health for environment: {args.env}")
    results = fetch_health_data(args.env)
    generate_pdf(results)
