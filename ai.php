<?php
session_start();
ini_set('log_errors', 1);
ini_set('error_log', '/home/u291518478/domains/bmreducation.com/public_html/logs/admin_control/education_sec.php');
error_reporting(E_ALL);
ini_set('display_errors', 0);
date_default_timezone_set('Asia/Kolkata');
session_regenerate_id(true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER['SCRIPT_URI'] === 'https://www.bmreducation.com/screenscape/ai') {
        try {
                    if (isset($_POST['input-field']) && isset($_POST['conversation_history']) && isset($_POST['fileid']) && !empty($_POST['input-field']) && !empty($_POST['conversation_history']) && !empty($_POST['fileid'])) {
              $request = $_POST['input-field'];           
    $curl = curl_init();
     $url = "https://bmr.org.in/chat_docx/chat";
     $data = [
            'question' => $request,
            'file_id' => $_POST['fileid'],
            'chat_history'=>$_POST['conversation_history']
        ];

                       $jsonData = json_encode($data);

                                            curl_setopt($curl, CURLOPT_URL, $url);
                                            curl_setopt($curl, CURLOPT_POST, true);
                                            curl_setopt($curl, CURLOPT_POSTFIELDS, $jsonData);
                                            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
                                            curl_setopt($curl, CURLOPT_HEADER, false);

                                            curl_setopt($curl, CURLOPT_HTTPHEADER, ["Content-Type: application/json", "Content-Length: " . strlen($jsonData), "Referer: https://ai.bmreducation.com"]);

        $response = curl_exec($curl);
        
                            if ($response === false) {
                                $error = curl_error($curl);
                                error_log("Curl Error: $error");
                                echo json_encode(['status' => "failed", "response" => "Coduldnt process now"]);
                                exit();
                            } else {
                                $decodedResponse = json_decode($response, true);
                                if (isset($decodedResponse['status']) && $decodedResponse['status'] == 'success') {
                                    echo json_encode(['status' => "success", "response" => $decodedResponse['response']]);
                                } else {
                                    error_log($decodedResponse['response']);
                                    echo json_encode(['status' => "failed", "response" => $decodedResponse]);
                                }
                            }
                            curl_close($curl);
                            exit();
                    } else {
                        error_log("Incomplete form submission.");
                        echo json_encode(['status' => 'failed', 'response' => "Incomplete form submission."]);
                    }

        } catch (Exception $e) {
            error_log($e->getMessage());
            echo json_encode(['status' => 'failed', 'response' => 'An error occurred. Please try again later']);
        } finally {
            if (isset($conn)) {
                $conn->close();
            }
            if (isset($conn1)) {
                $conn1->close();
            }
        }
} else {
    error_log("Invalid Request.");
    echo json_encode(['status' => 'failed', 'response' => 'Invalid Request 3']);
}
?>