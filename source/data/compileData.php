<?php
$responses = array('a', 'b', 'c', 'd');
$count = 1;
$csv = fopen('user_response_permutations.csv', 'w');

foreach ($responses as $a) {
    foreach ($responses as $b) {
        foreach ($responses as $c) {
            foreach ($responses as $d) {
                foreach ($responses as $e) {
                    print("\n$count");
                    foreach ($responses as $f) {
                        foreach ($responses as $g) {
                            foreach ($responses as $h) {
                                foreach ($responses as $i) {
                                    fputcsv($csv, array(implode('', array($a,$b,$c,$d,$e,$f,$g,$h,$i))));
                                    $count++;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

?>