({
    /* Send a request to the server for chart data */
	doServerRequest : function(component, helper, batchId, week, traineeId) {
        // invalidate the current data
        component.set('v.serverResponseData', null);
        // clear error message
        component.set('v.errorMsg', null);
        // setup server request
        // set the server method to call based on the filters
        var serverMethod;
        if (week && traineeId) {
            serverMethod = 'c.getBatchSingleWeekSingleTraineeTechSkillsRadar';
        } else if (traineeId) {
            serverMethod = 'c.getBatchAllWeeksSingleTraineeTechSkillsRadar';
        } else {
            serverMethod = 'c.getBatchOverallTechSkillsRadar';
        }
		var action = component.get(serverMethod);
        
        // set parameters for the server method being called
        if (week && traineeId) {
            action.setParams({
                batchID : batchId,
                traineeID : traineeId,
                week : week
            });
        } else if (traineeId) {
            action.setParams({
                batchID : batchId,
                traineeID : traineeId
            });
        } else {
            action.setParams({
                batchID : batchId
            });
        }
        
        // set the callback that will handle the response
        action.setCallback(this, function(response) {
            // only render the chart if success
            var state = response.getState();
            if (state === 'SUCCESS') {
                var data = response.getReturnValue();
                // if only one trainee, set them as shown, reset shown trainees otherwise
                if (traineeId) {
                    component.set('v.shownTraineesValue', ['0']);
                } else {
                    component.set('v.shownTraineesValue', []);
                }
                // save the data for later use
                component.set('v.serverResponseData', data);
                helper.createChart(component, helper);
            } else if (state === 'INCOMPLETE') {
                // notify the user
                console.log('ReportBatchOverallTechSkillsRadar: Server state was INCOMPLETE');
                component.set('v.errorMsg', 'Error communicating with server.');
            } else if (state === 'ERROR') {
                // notify the user of the error
                var errors = response.getError();
                var errorMsg = 'Unknown Error';
                if (errors) {
                    if (errors[0] && erros[0].message) {
                    	errorMsg = 'Error Message: ' + errors[0].message;
                    }
                }
                console.log('ReportBatchOverallTechSkillsRadar: Server returned error: ' + errorMsg);
                component.set('v.errorMsg', errorMsg);
            }
        });
        // send the request
        $A.enqueueAction(action);
	},
    createChart : function(component, helper) {
        var serverResponseData = component.get('v.serverResponseData');
        // need server response data to continue
        if (!serverResponseData) {
            console.log('ReportBatchOverallTechSkillsRadar.createChart: serverResponseData missing');
            return;
        }
        // populate the list of trainees available to select for the chart
        helper.populateTraineeList(component, serverResponseData);
        
        var batchData = serverResponseData.batch;
        var traineesData = serverResponseData.trainee;
        var shownTraineesValue = component.get('v.shownTraineesValue');
        
        // get chart data
        var chartData = {};
        // add category labels
        var categoryIndexMap = {};
        chartData.labels = [];
        batchData.categories.forEach(function(category) {
            var categoryName = category.name;
            chartData.labels.push(categoryName);
            categoryIndexMap[categoryName] = chartData.labels.indexOf(categoryName);
        });
        
        // add datasets
        chartData.datasets = [];
        // format batch data for chart.js
        var batchDataset = helper.getChartJSDataset(batchData, categoryIndexMap);
        helper.addColorsToChartJSDataset(component, batchDataset, 0);
        chartData.datasets.push(batchDataset);
        
        // format trainee data for chart.js for shown trainees
        var nextColorIndex = 1;
        shownTraineesValue.forEach(function(indexString) {
            var index = Number.parseInt(indexString);
            var traineeDataset = helper.getChartJSDataset(traineesData[index], categoryIndexMap);
        	helper.addColorsToChartJSDataset(component, traineeDataset, nextColorIndex);
            nextColorIndex += 1;
            chartData.datasets.push(traineeDataset);
        });
        
        /* create chart config
         * use 1:1 aspect ratio
         * show legend
         * make chart scale 0 to 100
         */
        var chartConfig = {
            type: 'radar',
            data: chartData,
            options: {
                aspectRatio: 1,
                legend: {
                    display: true
                },
                scale: {
                    ticks: {
                        min: 0,
                        max: 100
                    }
                }
            }
        };
        
        // render the chart
        var element = component.find('chart').getElement();
        var chart = new Chart(element, chartConfig);
    },
    /* populate the list of trainees available to select for the chart
     * <lightning:checkboxGroup> wants a list of objects with the format
     * {label: String, value: String}
     */
    populateTraineeList : function(component, serverResponseData) {
        var traineeData = serverResponseData['trainee'];
        var shownTraineesOptions = [];
        for (var i = 0; i < traineeData.length; i++) {
            var trainee = traineeData[i];
            shownTraineesOptions.push({
                label : trainee['name'],
                value: '' + i
            });
        }
        component.set('v.shownTraineesOptions', shownTraineesOptions);
    },
    /* Get the chart.js dataset for a single trainee or the batch overall */
    getChartJSDataset : function(serverDataSingle, categoryIndexMap) {
        // create object to return
        var dataset = {};
        // add dataset label
        dataset.label = serverDataSingle.name;
        // add dataset data
        // do not assume that categories are always in the same order
        dataset.data = [];
        var categories = serverDataSingle.categories;
        categories.forEach(function(category) {
            var categoryName = category.name;
            var categoryGrade = category.grade;
            var categoryIndex = categoryIndexMap[categoryName];
            dataset.data[categoryIndex] = categoryGrade;
        });
        // return the dataset
        return dataset;
    },
    /* Add colors to a chart.js dataset
     * colorIndex is the index in the colors array
     * use colorIndex === 0 for batch overall
     * if colorIndex is outside the array,
     * then a random color will be added to the array
     */
    addColorsToChartJSDataset : function(component, chartJSDataset, colorIndex) {
        /* array of colors to use
         */
        var colors = component.get('v.chartColors');
        
        // color alpha values
        var backgroundColorAlpha = 0.5;
        var borderColorAlpha = 1.0;
        var hoverColorAlpha = 0.3;
        
        /* convert objects in the colors array to the format for chart.js
         * chart.js uses a default alpha value of 1.0 when it is not specified
         * chart.js also supports hexadecimal and HSL notation
         */
        function colorToString(rgb, alpha) {
            return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha;
        }
        
        // get a random RGB color value
        function getRandomColorValue() {
            return Math.floor(Math.random() * 256);
        }
        
        if (colorIndex < colors.length) {
            // add a new color if needed
            colors.push({
                r: getRandomColorValue(),
                g: getRandomColorValue(),
                b: getRandomColorValue()
            });
            component.set('v.chartColors', colors);
        }
        
        // add colors to chart.js dataset
        chartJSDataset.backgroundColor = colorToString(colors[colorIndex], backgroundColorAlpha);
        chartJSDataset.pointBackgroundColor = colorToString(colors[colorIndex], backgroundColorAlpha);
        chartJSDataset.borderColor = colorToString(colors[colorIndex], borderColorAlpha);
        chartJSDataset.pointHoverBackgroundColor = colorToString(colors[colorIndex], hoverColorAlpha);
        chartJSDataset.pointHoverBorderColor = colorToString(colors[colorIndex], hoverColorAlpha);
        chartJSDataset.pointBorderColor = '#FFF';
        // radar chart should only use fill for batch overall, which we assume to use color index 0
        chartJSDataset.fill = colorIndex === 0;
	},
    /* for testing only */
    testServerRequest : function(component, helper, useSingleTrainee) {
        // invalidate the current data
        component.set('v.serverResponseData', null);
        // clear error message
        component.set('v.errorMsg', null);
        
        // create test data
        var testNumTrainees = 10;
        var testNumCategories = 5;
        var data = {
            batch: {
                name: 'Test Batch Name',
                categories: []
            },
            trainee: []
        };
        var testCategorySums = [];
        // fill sums array with 0
        for (var i = 0; i < testNumCategories; i++) {
            testCategorySums.push(0);
        }
        // create trainee test data
        for (var i = 0; i < testNumTrainees; i++) {
            var currentTrainee = {
                name : 'Test Trainee ' + i,
                categories : []
            };
            for (var j = 0; j < testNumCategories; j++) {
                // grade is random number from 60 to 90
                var testGrade = Math.floor(Math.random() * 30 + 60);
                currentTrainee.categories.push({
                    name : 'Test Cat ' + j,
                    grade : testGrade
                });
                /* always need to calculate sum for many trainees
                 * to make batch overall not equal to the grades
                 * when filtering by trainee
                 */
                testCategorySums[j] += testGrade;
            }
            // only add one trainee to the chart if filtering by trainee
            if (!useSingleTrainee || useSingleTrainee && data.trainee.length == 0) {
                data.trainee.push(currentTrainee);
            }
        }
        // add batch overall to chart
        for (var i = 0; i < testNumCategories; i++) {
            // average of trainee grades
            var testGrade = testCategorySums[i] / testNumTrainees;
            data.batch.categories.push({
                name : 'Test Cat ' + i,
                grade : testGrade
            });
        }
        
        // if only one trainee, set them as shown, reset shown trainees otherwise
        if (useSingleTrainee) {
            component.set('v.shownTraineesValue', ['0']);
        } else {
            component.set('v.shownTraineesValue', []);
        }
        // set test server response data
        component.set('v.serverResponseData', data);
        helper.createChart(component, helper);
    }
})