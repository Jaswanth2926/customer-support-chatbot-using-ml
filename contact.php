<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

session_start();
ini_set('log_errors', 1);
ini_set('error_log', '/home/u291518478/domains/bmreducation.com/public_html/logs/admin_control/education_sec.php');
error_reporting(E_ALL);
ini_set('display_errors', 0);
date_default_timezone_set('Asia/Kolkata');
session_regenerate_id(true);

require '../vendor1/autoload.php';
require_once 'config.php';

use PHPMailer\PHPMailer\PHPMailer;

class ContactHandler {
    private $conn;
    private $table = 'screenscape_contact_messages ';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function processContact($data) {
        try {
            // Save to database
            $query = "INSERT INTO " . $this->table . "
                    (name, email, subject, message)
                    VALUES (:name, :email, :subject, :message)";

            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':email', $data->email);
            $stmt->bindParam(':subject', $data->subject);
            $stmt->bindParam(':message', $data->message);

            if(!$stmt->execute()) {
                throw new Exception("Failed to save message");
            }

            // Send confirmation email
            if(!$this->sendConfirmationEmail($data)) {
                throw new Exception("Failed to send confirmation email");
            }

            return true;
        } catch(Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    private function sendConfirmationEmail($data) {
        $mail = new PHPMailer(true);
    
        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host = 'smtp.hostinger.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'login@bmreducation.com';
            $mail->Password = 'Moksha@10171+10170';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            // Recipients
            $mail->setFrom('login@bmreducation.com', 'ScreenScape');
            $mail->addAddress($data->email);

            // HTML Content
            $htmlBody ="
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1'>
            </head>
            <body style='margin: 0; padding: 0;'>
                <div style='max-width: 600px; margin: 0 auto; font-family: Poppins, Arial, sans-serif; background-color: #1a1a1a; color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.2);'>
                    <!-- Header -->
                    <div style='background: linear-gradient(45deg, #ff2c1f, #ff6b6b); padding: 40px; text-align: center;  border-radius: 16px; margin:10px;'>
                        <h1 style='margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;'>ScreenScape</h1>
                        <p style='margin: 10px 0 0; font-size: 16px; color: rgba(255,255,255,0.9);'>Where Movies Come Alive</p>
                    </div>

                    <!-- Main Content -->
                    <div style='padding: 40px 30px; background-color: #1f1f1f;'>
                        <!-- Confirmation Badge -->
                        <div style='text-align: center; margin-bottom: 30px;'>
                            <span style='display: inline-block; background-color: rgba(255,44,31,0.1); color: #ff2c1f; padding: 10px 24px; border-radius: 30px; font-weight: 600; font-size: 14px; border: 1px solid rgba(255,44,31,0.3);'>Message Received Successfully</span>
                        </div>

                        <!-- Greeting -->
                        <div style='margin-bottom: 30px;'>
                            <h2 style='color: #ffffff; font-size: 24px; margin: 0 0 15px;'>Dear {$data->name},</h2>
                            <p style='color: #e0e0e0; line-height: 1.6; margin: 0; font-size: 16px;'>Thank you for reaching out to ScreenScape Entertainment. We've received your message and our team will review it promptly.</p>
                        </div>

                        <!-- Message Details -->
                        <div style='background-color: #2c2c2c; border-radius: 12px; padding: 30px; margin: 30px 0; border: 1px solid rgba(255,255,255,0.1);'>
                            <h3 style='color: #ff2c1f; font-size: 18px; margin: 0 0 20px; font-weight: 600;'>Message Details</h3>
                            
                            <div style='margin-bottom: 20px;'>
                                <p style='color: #ffffff; font-weight: 600; margin: 0 0 8px;'>Subject</p>
                                <p style='color: #e0e0e0; margin: 0; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);'>{$data->subject}</p>
                            </div>

                            <div>
                                <p style='color: #ffffff; font-weight: 600; margin: 0 0 8px;'>Message</p>
                                <p style='color: #e0e0e0; margin: 0; line-height: 1.6;'>{$data->message}</p>
                            </div>
                        </div>

                        <!-- Response Time Notice -->
                        <div style='text-align: center; padding: 20px 0; border-top: 1px solid rgba(255,255,255,0.1);'>
                            <p style='color: #b0b0b0; margin: 0; font-style: italic; font-size: 14px;'>Our team typically responds within 24 hours during business days.</p>
                        </div>
                    </div>

                    <!-- Contact Information -->
                    <div style='background-color: #2c2c2c; padding: 30px; text-align: center;'>
                        <div style='margin-bottom: 25px;'>
                            <h4 style='color: #ffffff; margin: 0 0 15px; font-size: 18px; font-weight: 600;'>ScreenScape Entertainment</h4>
                            <p style='color: #b0b0b0; margin: 5px 0; font-size: 14px;'>123 Movie Plaza, Cinema Street</p>
                            <p style='color: #b0b0b0; margin: 5px 0; font-size: 14px;'>support@screenscape.com</p>
                            <p style='color: #b0b0b0; margin: 5px 0; font-size: 14px;'>+1 234 567 8900</p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style='background-color: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);'>
                        <p style='color: #808080; margin: 0 0 5px; font-size: 12px;'>BMR EDUCATION V4 Mail Service</p>
                        <p style='color: #808080; margin: 0; font-size: 12px;'>Customer ID: 70981279</p>
                    </div>
                </div>
            </body>
            </html>";
            

            $mail->isHTML(true);
            $mail->Subject = 'Thank You for Contacting ScreenScape';
            $mail->Body = $htmlBody;
            $mail->AltBody = strip_tags(str_replace('<br>', "\n", $htmlBody));

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Email sending failed: " . $mail->ErrorInfo);
            return false;
        }
    }
}

// Handle the incoming request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    try {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!$data || !$data->name || !$data->email || !$data->subject || !$data->message) {
            throw new Exception('Invalid input data');
        }

        $handler = new ContactHandler();
        $result = $handler->processContact($data);

        echo json_encode([
            'success' => $result,
            'message' => $result ? 'Message sent successfully' : 'Failed to send message'
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}
?>