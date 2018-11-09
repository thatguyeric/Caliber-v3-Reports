({
    //Fetch the name list form the Apex controller
    getWeeks : function(obj) {
        var weeks = [];
        for(let i = 1; i < obj.numOfWeeks + 1; i++){
            weeks.push("Week " + i);
        }
        return weeks;
    },
    getTraineeNames : function(obj){
        var traineeNames = [];
        for(let i = 0; i < obj.trainees.length; i++){
            traineeNames.push(obj.trainees[i].name);
        }
        return traineeNames;
    }
})