({
	doServerRequest : function(component, helper, batchId, week, traineeId) {
        // setup server request
        // set the method to call on the server based on filters
        var serverMethod;
        if (week && traineeId) {
            serverMethod = 'c.getBatchSingleWeekSingleTraineeTechSkillsRadar';
        } else if (traineeId) {
            serverMethod = 'c.getBatchAllWeeksSingleTraineeTechSkillsRadar';
        } else {
            serverMethod = 'c.getBatchOverallTechSkillsRadar';
        }
		var action = component.get(serverMethod);
        
        // set parameters based on filters
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
                component.set('v.errorMsg', null);
                var data = response.getReturnValue();
                // if only one trainee, set them as shown, reset it otherwise
                if (traineeId) {
                    component.set('v.shownTraineesValue', ['0']);
                } else {
                    component.set('v.shownTraineesValue', []);
                }
                // save the data for later use
                component.set('v.serverResponseData', data);
                helper.createChart(component, helper, data);
            } else if (state === 'INCOMPLETE') {
                component.set('v.errorMsg', 'Error communicating with server.');
            } else if (state === 'ERROR') {
                var errors = response.getError();
                var errorMsg = 'Unknown Error';
                if (errors) {
                    if (errors[0] && erros[0].message) {
                    	errorMsg = 'Error Message: ' + errors[0].message;
                    }
                }
                component.set('v.errorMsg', errorMsg);
            }
        });
        // send the request
        $A.enqueueAction(action);
	},
    createChart : function(component, helper, serverResponseData) {
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
        //TODO: set batch color
        _CaliberReportChartJSDatasetColors.put(batchDataset, 'radar', 0);
        chartData.datasets.push(batchDataset);
        
        // format trainee data for chart.js for shown trainees
        var nextColorIndex = 1;
        shownTraineesValue.forEach(function(indexString) {
            var index = Number.parseInt(indexString);
            var traineeDataset = helper.getChartJSDataset(traineesData[index], categoryIndexMap);
        	//TODO: set color for first few trainees, if they exist
        	_CaliberReportChartJSDatasetColors.put(traineeDataset, 'radar', nextColorIndex);
            nextColorIndex += 1;
            chartData.datasets.push(traineeDataset);
        });
        
        var chartConfig = {
            type: 'radar',
            data: chartData,
            options: {
                scale: {
                    ticks: {
                        min: 0,
                        max: 100
                    }
                }
            }
        };
        
        var element = component.find('chart').getElement();
        var chartContext = element.getContext('2d');
        var chart = new Chart(chartContext, chartConfig);
    },
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
    /* for testing only */
    test : function(component, helper) {
        // set to true when not testing
        if (false) {
            return;
        }
        component.set('v.errorMsg', null);
        
        // create test data
        var testNumTrainees = 5;
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
        for (var i = 0; i < testNumTrainees; i++) {
            data.trainee.push({
                name : 'Test Trainee ' + i,
                categories : []
            });
            for (var j = 0; j < testNumCategories; j++) {
                // grade is random number from 60 to 90
                var testGrade = Math.floor(Math.random() * 30 + 60);
                data.trainee[i].categories.push({
                    name : 'Test Cat ' + j,
                    grade : testGrade
                });
                testCategorySums[j] += testGrade;
            }
        }
        for (var i = 0; i < testNumCategories; i++) {
            // average of trainee grades
            var testGrade = testCategorySums[i] / testNumTrainees;
            data.batch.categories.push({
                name : 'Test Cat ' + i,
                grade : testGrade
            });
        }
        
        // save the data for later use
        component.set('v.serverResponseData', data);
        helper.createChart(component, helper, data);
    }
})