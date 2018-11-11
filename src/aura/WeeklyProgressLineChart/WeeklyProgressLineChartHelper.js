({
    doServerRequest : function(component, helper, batchId, traineeId, week) {
        
        var action;
        if(week){
            action = component.get('c.getBatchSingleWeekSingleTraineeWeeklyProgressLine');
            action.setParams({ batchID : batchId,
                              traineeID: traineeId,
                              week : week});
        }else if(traineeId){
            action = component.get('c.getBatchAllWeeksSingleTraineeWeeklyProgressLine');
            action.setParams({ batchID : batchId,
                              traineeID: traineeId});
        }else{
            action = component.get('c.getBatchOverallWeeklyProgressLine');
            action.setParams({ batchID : batchId});
        }
       	
        action.setCallback(this, function(response){
           
            var state = response.getState();
             console.log(response.getError()[0].message);
            if(state === "SUCCESS"){
                component.set('v.errorMsg', null);
                var tempdata = response.getReturnValue();
                var data = JSON.parse(tempdata);
                console.log(data);
                helper.configureWeeklyProgressChart(component, helper, data);
            }else if(state === "INCOMPLETE"){
                var errormsg = 'Incomplete server request.';
                component.set('v.errorMsg', errormsg);
            }else if (state === 'ERROR') {
                // notify the user of the error
                var errors = response.getError();
                var errorMsg = 'Unknown Error';
                if (errors) {
                    if (errors[0] && errors[0].message) {
                    	errorMsg = 'Error Message: ' + errors[0].message;
                    }
                }
                console.log('Server returned error: ' + errorMsg);
                component.set('v.errorMsg', errorMsg);
                
            }
        });
        $A.enqueueAction(action);
        
    },
    
    configureWeeklyProgressChart : function(component, helper, data){
        //configure batch data
        if(!data){
             component.set('v.errorMsg', 'Insufficient data');
        }else{
        var batchdata = data.batch;	
        
        function comparebyWeek(a, b){
            if(a.week < b.week){
                return -1;
            }
            if(a.week > b.week){
                return 1;
            }
            //a must be equal to b
            return 0;
            
        }
        
        batchdata.sort(comparebyWeek);
        
        //get labels and grades for chart
        var labels = [];
        var batchGrades = [];
        //store label, name, and grade values
        batchdata.forEach(function(name){
            var batchGrade = name.grade;
            var batchWeek = name.week;
            labels.push(batchWeek);
            batchGrades.push(batchGrade);
        });
        
        
        var trainees = data.trainee;
        if(trainees){
            trainees.sort(comparebyWeek);
            //configure trainee data
            //get grades for chart
            var traineeGrades = [];
            //store grade values
            trainees.forEach(function(name){
                var traineeGrade = name.grade;
                traineeGrades.push(traineeGrade);
            });
        }
        
        helper.renderChart(component, helper, batchGrades, traineeGrades, labels);
            }
    },
    
    renderChart : function(component, helper, batchGrades, traineeGrades, labels){
        
        var chartElement = component.find("chart").getElement();
        var dataset = [];
        
        var batchGradeDataset = {
            data: batchGrades,
            label: 'Batch',
            backgroundColor: 'rgba(252, 180, 20, 0.5)',
            borderColor: 'rgba(252, 180, 20, 1)',
            fill: false
        };
        
        dataset.push(batchGradeDataset);
        
        if(traineeGrades){
            var traineeGradeDataset = {
                data: traineeGrades,
                label: 'Trainee',
                backgroundColor: 'rgba(114, 164, 194, 0.5)',
                borderColor: 'rgba(114, 164, 194, 1)',
                fill: false
            };
            dataset.push(traineeGradeDataset);
        }
        
        //create chart
        
        var initChart = new Chart(chartElement, {
            type: 'line',
            data: {
                labels: labels,
                datasets: dataset             
            },
            options: {
                scales: {
                    yAxes: [{
                        stacked: false
                    }]
                }
            }
        });
        
        
    },
    
    test : function(component, helper){
        //test method before integration with server
        var data = {
            batch : [{
                week : 1,
                grade : 94.5
            },{
                week : 2,
                grade : 85.3  
            },{
                week : 3,
                grade : 75.8
            },{
                week : 4,
                grade : 92.3
            }              
                    ],
            trainee : [{
                week : 1,
                grade : 92
            },{
                week : 2,
                grade : 84
            }, {
                week : 3,
                grade : 71
            }, {
                week : 4,
                grade : 97
            }]
        };
        
        helper.configureWeeklyProgressChart(component, helper, data);
    }
})