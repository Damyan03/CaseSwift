import sys
import win32com.client

def send_email(subject, body, recipients, cc_recipients):
    # Create an instance of the Outlook application
    outlook = win32com.client.Dispatch("Outlook.Application")

    # Create a new mail item
    mail = outlook.CreateItem(0)
    mail.Subject = subject
    
    # Set the body format to HTML
    mail.BodyFormat = 2
    mail.HTMLBody = body

   # Add primary recipients
    mail.Recipients.Add(recipients)
    
    # Add CC recipients
    mail.CC = cc_recipients

    # Send the email
    # mail.Send()

# Retrieve command-line arguments
subject = sys.argv[1]
body = sys.argv[2]
recipients = sys.argv[3]
cc_recipients = sys.argv[4]

# Call the send_email function with the provided arguments
send_email(subject, body, recipients, cc_recipients)