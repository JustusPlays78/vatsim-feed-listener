<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VATSIM Flugdaten - STATSIM API</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #007acc;
            padding-bottom: 10px;
        }
        
        .form-container {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 30px;
            border: 1px solid #ddd;
        }
        
        .form-row {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            align-items: end;
            margin-bottom: 15px;
        }
        
        .form-group {
            flex: 1;
            min-width: 150px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        
        input[type="text"], input[type="datetime-local"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }
        
        button {
            background-color: #007acc;
            color: white;
            padding: 12px 25px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        
        button:hover {
            background-color: #005a99;
        }
        
        .error {
            background-color: #ffebee;
            color: #c62828;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            border-left: 4px solid #c62828;
        }
        
        .success {
            background-color: #e8f5e8;
            color: #2e7d32;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            border-left: 4px solid #2e7d32;
        }
        
        .flights-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .flights-table th {
            background-color: #007acc;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #005a99;
        }
        
        .flights-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
        }
        
        .flights-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .flights-table tr:hover {
            background-color: #f0f8ff;
        }
        
        .callsign {
            font-weight: bold;
            color: #007acc;
        }
        
        .route {
            font-size: 12px;
            max-width: 200px;
            word-break: break-all;
        }
        
        .aircraft {
            font-family: monospace;
            font-size: 12px;
        }
        
        .time {
            font-size: 12px;
            color: #666;
        }
        
        .status-arrived {
            color: #2e7d32;
            font-weight: bold;
        }
        
        .status-departed {
            color: #f57c00;
            font-weight: bold;
        }
        
        .stats {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .stat-box {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            flex: 1;
            min-width: 120px;
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #007acc;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        
        @media (max-width: 768px) {
            .form-row {
                flex-direction: column;
            }
            
            .flights-table {
                font-size: 12px;
            }
            
            .flights-table th,
            .flights-table td {
                padding: 6px 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>VATSIM Flugdaten Viewer</h1>
        
        <div class="form-container">
            <form method="POST" action="">
                <div class="form-row">
                    <div class="form-group">
                        <label for="icao">ICAO Zielflughafen:</label>
                        <input type="text" id="icao" name="icao" value="<?php echo isset($_POST['icao']) ? htmlspecialchars($_POST['icao']) : 'EDDF'; ?>" placeholder="z.B. EDDF" maxlength="4" required>
                    </div>
                    <div class="form-group">
                        <label for="from">Von (Datum/Zeit):</label>
                        <input type="datetime-local" id="from" name="from" value="<?php echo isset($_POST['from']) ? $_POST['from'] : date('Y-m-d\TH:i', strtotime('-2 hours')); ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="to">Bis (Datum/Zeit):</label>
                        <input type="datetime-local" id="to" name="to" value="<?php echo isset($_POST['to']) ? $_POST['to'] : date('Y-m-d\TH:i'); ?>" required>
                    </div>
                    <div class="form-group">
                        <button type="submit">Flugdaten laden</button>
                    </div>
                </div>
            </form>
        </div>

<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $icao = strtoupper(trim($_POST['icao']));
    $from = $_POST['from'];
    $to = $_POST['to'];
    
    // Validierung
    if (empty($icao) || strlen($icao) !== 4) {
        echo '<div class="error">Bitte geben Sie einen gültigen 4-stelligen ICAO-Code ein.</div>';
    } elseif (strtotime($from) >= strtotime($to)) {
        echo '<div class="error">Das "Von"-Datum muss vor dem "Bis"-Datum liegen.</div>';
    } else {
        // API URL zusammenbauen
        $fromFormatted = urlencode(date('c', strtotime($from)));
        $toFormatted = urlencode(date('c', strtotime($to)));
        $apiUrl = "https://api.statsim.net/api/Flights/IcaoDestination?icao={$icao}&from={$fromFormatted}&to={$toFormatted}";
        
        echo '<div class="success">API-Aufruf: <a href="' . htmlspecialchars($apiUrl, ENT_QUOTES) . '" target="_blank">Daten laden von STATSIM</a></div>';
        
        // API-Aufruf mit file_get_contents (SSL-optimiert für Windows)
        $context = stream_context_create([
            'http' => [
                'timeout' => 30,
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'method' => 'GET',
                'header' => [
                    'Accept: application/json',
                    'Accept-Language: en-US,en;q=0.9',
                    'Connection: close'
                ],
                'ignore_errors' => true
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true,
                'disable_compression' => true,
                'SNI_enabled' => true,
                'ciphers' => 'DEFAULT:!DH'
            ]
        ]);
        
        $response = @file_get_contents($apiUrl, false, $context);
        
        // Falls HTTPS fehlschlägt, versuche HTTP (falls verfügbar)
        if ($response === false && strpos($apiUrl, 'https://') === 0) {
            $httpApiUrl = str_replace('https://', 'http://', $apiUrl);
            echo '<div style="color: orange; margin: 10px 0; font-size: 12px;">⚠️ HTTPS fehlgeschlagen, versuche HTTP...</div>';
            $response = @file_get_contents($httpApiUrl, false, $context);
            if ($response !== false) {
                echo '<div style="color: green; margin: 10px 0; font-size: 12px;">✅ HTTP-Verbindung erfolgreich!</div>';
            }
        }
        
        if ($response === false) {
            $error = error_get_last();
            echo '<div class="error">Fehler beim Laden der Daten von der API.<br>';
            if ($error) {
                echo 'Details: ' . htmlspecialchars($error['message']) . '<br>';
            }
            
            // Teste die Netzwerkverbindung
            echo '<div style="margin-top: 10px; font-size: 12px; color: #666;">';
            echo 'Netzwerk-Test: ';
            $testUrl = "http://httpbin.org/get";
            $simpleContext = stream_context_create(['http' => ['timeout' => 10]]);
            $testResponse = @file_get_contents($testUrl, false, $simpleContext);
            if ($testResponse !== false) {
                echo '✅ Internet-Verbindung OK<br>';
                // Teste auch HTTPS
                $httpsTest = @file_get_contents("https://httpbin.org/get", false, $context);
                if ($httpsTest !== false) {
                    echo '✅ HTTPS funktioniert<br>';
                } else {
                    echo '⚠️ HTTPS Problem (SSL-Zertifikate)<br>';
                }
            } else {
                echo '❌ Internet-Verbindung Problem<br>';
            }
            echo '</div>';
            
            echo 'URL: <a href="' . $apiUrl . '" target="_blank">' . $apiUrl . '</a><br>';
            echo 'Bitte versuchen Sie es später noch einmal oder prüfen Sie die Netzwerkverbindung.</div>';
        } else {
            $flights = json_decode($response, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                echo '<div class="error">Fehler beim Verarbeiten der API-Antwort: ' . json_last_error_msg() . '</div>';
            } elseif (empty($flights)) {
                echo '<div class="error">Keine Flugdaten für den angegebenen Zeitraum gefunden.</div>';
            } else {
                // Statistiken berechnen
                $totalFlights = count($flights);
                $arrivedFlights = count(array_filter($flights, function($f) { return !empty($f['arrived']); }));
                $departedFlights = count(array_filter($flights, function($f) { return !empty($f['departed']); }));
                $uniqueAirports = count(array_unique(array_column($flights, 'departure')));
                
                echo '<div class="stats">';
                echo '<div class="stat-box"><div class="stat-number">' . $totalFlights . '</div><div class="stat-label">Gesamt Flüge</div></div>';
                echo '<div class="stat-box"><div class="stat-number">' . $arrivedFlights . '</div><div class="stat-label">Angekommen</div></div>';
                echo '<div class="stat-box"><div class="stat-number">' . $departedFlights . '</div><div class="stat-label">Abgeflogen</div></div>';
                echo '<div class="stat-box"><div class="stat-number">' . $uniqueAirports . '</div><div class="stat-label">Abflughäfen</div></div>';
                echo '</div>';
                
                // Top Abflughäfen anzeigen
                $departureStats = array_count_values(array_column($flights, 'departure'));
                arsort($departureStats); // Sortiere nach Anzahl (absteigend)
                $topDepartures = array_slice($departureStats, 0, 10, true); // Top 10
                
                if (!empty($topDepartures)) {
                    echo '<div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #e9ecef;">';
                    echo '<h3 style="margin: 0 0 15px 0; color: #495057; font-size: 16px;">📍 Häufigste Abflughäfen</h3>';
                    echo '<div style="display: flex; flex-wrap: wrap; gap: 10px;">';
                    
                    foreach ($topDepartures as $airport => $count) {
                        $percentage = round(($count / $totalFlights) * 100, 1);
                        echo '<div style="background-color: white; padding: 8px 12px; border-radius: 4px; border: 1px solid #dee2e6; min-width: 100px;">';
                        echo '<div style="font-weight: bold; color: #007acc; font-size: 14px;">' . htmlspecialchars($airport) . '</div>';
                        echo '<div style="font-size: 12px; color: #666;">' . $count . ' Flüge (' . $percentage . '%)</div>';
                        echo '</div>';
                    }
                    
                    echo '</div>';
                    echo '</div>';
                }
                
                // Tabelle ausgeben
                echo '<table class="flights-table">';
                echo '<thead>';
                echo '<tr>';
                echo '<th>Callsign</th>';
                echo '<th>Von</th>';
                echo '<th>Nach</th>';
                echo '<th>Flugzeug</th>';
                echo '<th>Höhe</th>';
                echo '<th>Abflug</th>';
                echo '<th>Ankunft</th>';
                echo '<th>Online seit</th>';
                echo '<th>Route</th>';
                echo '</tr>';
                echo '</thead>';
                echo '<tbody>';
                
                // Sortieren nach Ankunftszeit
                usort($flights, function($a, $b) {
                    $timeA = !empty($a['arrived']) ? strtotime($a['arrived']) : PHP_INT_MAX;
                    $timeB = !empty($b['arrived']) ? strtotime($b['arrived']) : PHP_INT_MAX;
                    return $timeA - $timeB;
                });
                
                foreach ($flights as $flight) {
                    echo '<tr>';
                    echo '<td class="callsign">' . htmlspecialchars($flight['callsign']) . '</td>';
                    echo '<td>' . htmlspecialchars($flight['departure']) . '</td>';
                    echo '<td>' . htmlspecialchars($flight['destination']) . '</td>';
                    echo '<td class="aircraft">' . htmlspecialchars($flight['aircraft']) . '</td>';
                    // Höhe - behandle verschiedene Formate
                    $altitude = $flight['altitude'];
                    if (is_numeric($altitude)) {
                        echo '<td>' . number_format($altitude) . ' ft</td>';
                    } else {
                        // Für Fälle wie "FL360" oder andere String-Formate
                        echo '<td>' . htmlspecialchars($altitude) . '</td>';
                    }
                    
                    // Abflugzeit
                    if (!empty($flight['departed'])) {
                        $departTime = new DateTime($flight['departed']);
                        echo '<td class="time status-departed">' . $departTime->format('d.m. H:i') . '</td>';
                    } else {
                        echo '<td class="time">-</td>';
                    }
                    
                    // Ankunftszeit
                    if (!empty($flight['arrived'])) {
                        $arriveTime = new DateTime($flight['arrived']);
                        echo '<td class="time status-arrived">' . $arriveTime->format('d.m. H:i') . '</td>';
                    } else {
                        echo '<td class="time">-</td>';
                    }
                    
                    // Online seit
                    if (!empty($flight['loggedOn'])) {
                        $onlineTime = new DateTime($flight['loggedOn']);
                        echo '<td class="time">' . $onlineTime->format('d.m. H:i') . '</td>';
                    } else {
                        echo '<td class="time">-</td>';
                    }
                    
                    // Route
                    echo '<td class="route">' . htmlspecialchars($flight['route']) . '</td>';
                    echo '</tr>';
                }
                
                echo '</tbody>';
                echo '</table>';
                
                echo '<p style="margin-top: 20px; color: #666; font-size: 12px; text-align: center;">';
                echo 'Daten von STATSIM API • Letzte Aktualisierung: ' . date('d.m.Y H:i:s');
                echo '</p>';
            }
        }
    }
}
?>

    </div>
</body>
</html>