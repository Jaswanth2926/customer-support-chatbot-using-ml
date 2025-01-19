<?php
session_start();
ini_set('log_errors', 1);
ini_set('error_log', '/home/u291518478/domains/bmreducation.com/public_html/logs/admin_control/education_sec.php');
error_reporting(E_ALL);
ini_set('display_errors', 0);
date_default_timezone_set('Asia/Kolkata');
session_regenerate_id(true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER['SCRIPT_URI'] === 'https://www.bmreducation.com/screenscape/file-upload') {
        try {
                    if (isset($_FILES["filedata"])) {
                                    $file_name = $_FILES["filedata"]["name"];
                $file_size = $_FILES["filedata"]["size"];
                $file_tmp = $_FILES["filedata"]["tmp_name"];
                $file_type = $_FILES["filedata"]["type"];
                $max_file_size = 15 * 1024 * 1024;

                if ($file_size > $max_file_size || $file_size <= 0) {
                    $data = ['status' => "failed", "response" => "File size should not exceed 15MB"];
                    echo json_encode($data);
                    exit();
                }

              $curl = curl_init();
                $url = "https://bmr.org.in/chat_docx/upload";

                $data = [
                    "file" => new CURLFile($file_tmp, $file_type, $file_name),
                ];

                // Set cURL options
                curl_setopt($curl, CURLOPT_URL, $url);
                curl_setopt($curl, CURLOPT_POST, true);
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($curl, CURLOPT_HEADER, false);
                curl_setopt($curl, CURLOPT_HTTPHEADER, [
                    "Referer: https://www.bmreducation.com",
                ]);

                $response = curl_exec($curl);

                                     
                            if ($response === false) {
                                $error = curl_error($curl);
                                error_log("Curl Error: $error");
                                echo json_encode(['status' => "failed", "response" => "Coduldnt process now"]);
                                exit();
                            } else {
                                $decodedResponse = json_decode($response, true);
                                if (isset($decodedResponse['status']) && $decodedResponse['status'] == 'success') {
                                    $data = [
                        'status' => "success",
                        "response" => $decodedResponse["file_name"],
                    ];
                    echo json_encode($data);
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