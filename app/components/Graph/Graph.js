import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView } from "react-native";
import { LineChart } from "react-native-gifted-charts";

function Graph(props) {
    const [tooltipIndex, setTooltipIndex] = useState(-1);
    const [points, setPoints] = useState([]);
    const [labels, setLabels] = useState([]);

    useEffect(() => {
        if (props.patientDetails && props.patientDetails.bloodSugar) {
            // Map bloodSugar readings to points array
            const mappedPoints = props.patientDetails.bloodSugar.map((reading) => ({
                value: reading.value,
                label: new Date(reading.timestamp).toLocaleDateString("en-US", {
                    weekday: 'short'
                }),
            }));

            setPoints(mappedPoints);

            // Extract labels for X-axis
            const mappedLabels = props.patientDetails.bloodSugar.map((reading) =>
                new Date(reading.timestamp).toLocaleDateString("en-US", {
                    weekday: 'short'
                })
            );

            setLabels(mappedLabels);
        }
    }, [props.patientDetails]);

    // Create Y-axis labels for the range from 0 to 180 with an interval of 30
    const yAxisLabelTexts = Array.from({ length: 7 }, (_, i) => i * 30).map((value) => value.toString());

    return (
        <SafeAreaView style={{ width: '100%', backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>Blood Sugar Levels</Text>
            <Text style={{ textAlign: 'center', color: 'gray', marginBottom: 20 }}>15 April - 21 April</Text>
            <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 10 }}>
                <LineChart
                    data={points}
                    width={320} // Adjust width and height as per your layout
                    height={300}
                    initialSpacing={0}
                    spacing={50}
                    color="#017560"
                    yAxisColor="gray"
                    xAxisColor="gray"
                    xAxisLabelTextStyle={{ color: 'black', fontWeight: '600' }}
                    yAxisLabelTextStyle={{ color: 'black', fontWeight: '600' }}
                    hideYAxisText={false}
                    maxValue={180}
                    minValue={0}
                    noOfSections={6} // This determines the number of horizontal lines and sections
                    yAxisLabelTexts={yAxisLabelTexts} // Custom Y-axis labels
                    adjustToWidth={true}
                    isAnimated
                    hideDataPoints={false}
                    dataPointsColor="#017560"
                    xAxisLabelTexts={labels} // Custom X-axis labels
                    onDataPointClick={(dataPoint, index) => setTooltipIndex(index)}
                    dataPointLabelStyle={{ color: 'black', fontSize: 12 }}
                    renderTooltip={() => (
                        tooltipIndex > -1 && (
                            <View
                                style={{
                                    position: 'absolute',
                                    left: tooltipIndex * 50, // Adjust based on spacing
                                    top: points[tooltipIndex].value > 100 ? 150 : 100, // Adjust based on value
                                    backgroundColor: 'white',
                                    padding: 10,
                                    borderRadius: 5,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 1,
                                    elevation: 2
                                }}
                            >
                                <Text style={{ color: 'black' }}>
                                    {points[tooltipIndex].value} additional text
                                </Text>
                            </View>
                        )
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

export default Graph;
