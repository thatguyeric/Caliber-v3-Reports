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
                    component.set('v.shownTraineeIndexes', [0]);
                } else {
                    component.set('v.shownTraineeIndexes', []);
                }
                // save the data for later use
                component.set('v.serverResponseData', data)
                helper.populateTraineeList(component, data);
                helper.createChartConfig(component, helper, data);
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
    createChartConfig : function(component, helper, serverResponseData) {
        var batchData = serverResponseData.batch[0];
        var traineeData = serverResponseData.trainee;
        var shownTraineeIndexes = component.get('v.shownTraineeIndexes');
        
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
        chartData.datasets.push(batchDataset);
        
        // format trainee data for chart.js for shown trainees
        shownTraineeIndexes.forEach(function(index) {
            var singleTraineeData = traineeData[index];
            var singleTraineeDataset = helper.getChartJSDataset(singleTraineeData, categoryIndexMap);
        	//TODO: set color for first few trainees, if they exist
            chartData.datasets.push(singleTraineeDataset);
        });
        
        var chartConfig = {
            type: 'radar',
            data: chartData
        };
        
        // can only render chart if page is done loading
        // use ltng:require afterScriptsLoaded to render first time
        // if chartConfig is defined, then page must be done loading
        if (component.get('v.chartConfig')) {
            helper.renderChart(component);
        }
        
        component.set('v.chartConfig', chartConfig);
    },
    renderChart : function(component) {
        var chartConfig = component.get('v.chartConfig');
        if (chartConfig) {
            var element = component.find('chart').getElement();
            var chartContext = element.getContext('2d');
            var chart = new Chart(chartContext, chartConfig);
        }
    },
    populateTraineeList : function(component, serverResponseData) {
        var traineeData = serverResponseData['trainee'];
        var allTrainees = [];
        // the order of trainees must be the same in server response data and allTrainees list
        traineeData.forEach(function(trainee) {
            var name = trainee['name'];
            allTrainees.push(name);
        });
        component.set('v.allTrainees', allTrainees);
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
        // begin test code
        component.set('v.isVisible', true);
        component.set('v.errorMsg', null);
        var data = {
            batch: [{
                name: 'Test Batch Name',
                categories: [{
                    name : 'Test Cat 1',
            		grade : 85.0
                }, {
                    name : 'Test Cat 2',
            		grade : 75.0
                }, {
                    name : 'Test Cat 3',
            		grade : 75.0
                }, {
                    name : 'Test Cat 4',
            		grade : 75.0
                }, {
                    name : 'Test Cat 5',
            		grade : 75.0
                }]
            }],
            trainee: [{
                name: 'Test Trainee 1',
                categories: [{
                    name : 'Test Cat 1',
            		grade : 90.0
                }, {
                    name : 'Test Cat 2',
            		grade : 80.0
                }, {
                    name : 'Test Cat 3',
            		grade : 75.0
                }, {
                    name : 'Test Cat 4',
            		grade : 75.0
                }, {
                    name : 'Test Cat 5',
            		grade : 75.0
                }]
            }, {
                name: 'Test Trainee 2',
                categories: [{
                    name : 'Test Cat 1',
            		grade : 80.0
                }, {
                    name : 'Test Cat 2',
            		grade : 70.0
                }, {
                    name : 'Test Cat 3',
            		grade : 75.0
                }, {
                    name : 'Test Cat 4',
            		grade : 75.0
                }, {
                    name : 'Test Cat 5',
            		grade : 75.0
                }]
            }]
        };
        // if only one trainee, set them as shown, reset it otherwise
        component.set('v.shownTraineeIndexes', [1]);
        // save the data for later use
        component.set('v.serverResponseData', data)
        helper.populateTraineeList(component, data);
        helper.createChartConfig(component, helper, data);
    }
})