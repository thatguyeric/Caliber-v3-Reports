({
    doServerRequest : function(component, helper, batchId, week) {
        var action;
        //call different server methods based on criteria
        if(week){
            action = component.get("c.getBatchSingleWeekAllTraineesCumulativeScoresBar");
            action.setParams({ batchID : batchId,
                              week : week});
        }else{
            action = component.get("c.getBatchOverallCumulativeScoresBar");
            action.setParams({ batchID : batchId});  
        }
        
        //create callback function
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                component.set('v.errorMsg', null);
                var stringdata = response.getReturnValue();
                var data = JSON.parse(stringdata);
                helper.configureCumulativeScoresChart(component, helper, data);
            }else if(state === "INCOMPLETE"){
                var errormsg = 'Incomplete server request.';
                component.set('v.errorMsg', errormsg);
            }else{
                component.set('v.errorMsg', 'Some error has occurred');
            }
        });
        $A.enqueueAction(action);
        
    },
    
    configureCumulativeScoresChart : function(component, helper, data){
        //get key value pairs from JSON object
        if(!data){
            component.set('v.errorMsg', 'Insufficient data'); 
        }else{
            var batch = data.trainees;
            console.log('batch: ' + batch);
            
            batch.sort(function(a, b){
                if(a.grade < b.grade){
                    return 1;
                }
                if(a.grade > b.grade){
                    return -1;
                }
                //a must be equal to b
                return 0;
                
            });
            
            
            //create label and grade arrays
            var labels = [];
            var grades = [];
            var traineeData = [];
            //store label and grade values in arrays
            batch.forEach(function(name){
                var traineeGrade = name.grade;
                var traineeName = name.name;
                labels.push(traineeName);
                grades.push(traineeGrade);
                traineeData.push({
                    name: traineeName,
                    grade: traineeGrade
                });
            });
            component.set("v.traineeData", traineeData);
            
            //configure benchmark if valid
            var benchmarkValue = data.benchmark;
            if(benchmarkValue){
                var benchmark = [];
                //create benchmark line
                for(var i = 0; i < labels.length; i++){
                    benchmark.push(benchmarkValue);
                }       
            }
            
            //call render function
            helper.renderChart(component, helper, grades, benchmark, labels);
        }
    },
    
    renderChart : function(component, helper, grades, benchmark, labels){
        
        //access Lightning element
        var chartElement = component.find("chart").getElement();
        var dataset = [];
        //create benchmark dataset if applicable
        if(benchmark){
            var benchmarkDataset = {
                data: benchmark,
                label: 'Benchmark',
                backgroundColor: 'rgba(252, 180, 20, 0.5)',
                borderColor: 'rgba(252, 180, 20, 1)',
                type: 'line',
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 0                   
            };
            dataset.push(benchmarkDataset);
        }
       //create batch grades dataset for chart 
        var batchScoresDataset = {
            data: grades,
            label: 'Batch Scores',
            backgroundColor: 'rgba(114, 164, 194, 0.5)',
            borderColor: 'rgba(114, 164, 194, 1)'
        };
        dataset.push(batchScoresDataset);
        
        //create chart
        var initChart = new Chart(chartElement, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: dataset             
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                            max: 100
                        }
                    }]
                }
            }
        });
    },
    
    test : function(component, helper){
        //testing before server integration
        var data = {
            trainees: [{
                name: 'Jim 1',
                grade: 75.5
            }, {
                name: 'Jim 2',
                grade: 84.8
            },{
                name:  'Ying',
                grade: 92.5
            },{
                name: 'Lan',
                grade: 85.7
            }]
            
            ,
            benchmark: 75.3
        };
        helper.configureCumulativeScoresChart(component, helper, data);   
    }
    
})