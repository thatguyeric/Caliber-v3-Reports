# Documentation for Reports Page (180910-Salesforce)

### Table of Contents:
  * [Apex Controller methods](#apex-controller-methods)
  * [Lightning Components and JavaScript Controllers/Helpers](#lightning-components-and-javascript-controllershelpers)
  * [JSON format JavaScript controllers receive from Apex controllers](#json-format-javascript-controllers-receive-from-apex-controllers)

<hr/>

The Reports team has completed the overall charts for filtering by batch. The next step for this project is implementing 
the Quarter and Location filters and then creating the charts for week and trainee filters0. We have outlined what the JSON 
data format each controller should send and recieve at the end of this document. Each method is named as detailed as possible 
so that future batches have no problem picking up where we left off. 

## Apex Controller methods
### ReportsController.cls

```apex
Public static String getBatchOverallCumulativeScoresBar(Id batchId)
```
This method queries for all the caliber grades for each trainee that is associated with the current batch. 
Using the getAverageGrade() utility method, the grades of each trainee, as well as the benchmark, are 
calculated and mapped and serialized as seen on the reports_data_format file.

```apex
Public static String getBatchOverallQCTable(Id batchID)
```
This method queries for all the caliber notes for each trainee and overall batch that are associated with the 
current batch. Each trainee QC grade and note is mapped and added to a list of trainees. The batch’s overall 
QC grades and notes are then mapped and added to a list. The lists are then mapped and serialized as seen on 
the reports_data_format file.

```apex
public static String getBatchOverallTechSkillsRadar(Id batchID)
```
This method queries for all caliber grades for every assessment associated with the batch. Then it gathers sets of the trainee Ids and assessment categories, calculates the average grades for each category and trainee, then maps and returns them.

```apex
public static String getBatchOverallWeeklyProgressLine(Id batchID)
```
This method gets a list of grades and for every week gets the average of all the grades and maps them.

### Utility methods:
```apex
public static List<Training__c> getBatchesByYear(Decimal year)
```
This method queries for all batches that start or end in the specified year.

```apex
public static List<Integer> GetAllYearsWithBatches()
```
This method queries for every year that has at least one batch taking place.

```apex
public static List<String> buildBatchStrings(List<Training__c> trainings)
```
This method takes a list of batches and will return a list of strings containing the trainer’s name and the start date that will be displayed on the filters for each page.

```apex
public static Decimal getWeeksInBatch(Training__c batch)
```
This method returns the number of weeks a batch has been active.

```apex
public static List<String> batchWeeksStrings(Training__c batch)
```
This method returns a list of strings for the weeks a batch has been active to be displayed in the filters at the top of the page.

```apex
public static List<Contact> batchTrainees(Training__c batch)
```
This method takes a batch and queries for the trainees that are in the training.

```apex
public static Contact getSelectedTrainee(List<Id> allTraineeIds, String traineeName)
```
This method takes a list of the Id’s of each trainee in a batch and a string of the trainee chosen. Then it returns the contact associated with the id.

```apex
public static Training__c getSelectedBatch(List<Training__c> batches, String batchName)
```
This method takes a list of batches and the name of the chosen batch. Then it returns which batch was chosen by the user.

```apex
public static List<Id> getTraineeIDs(Id batchID)
```
This  method takes the batch Id and queries for the list of Ids for the trainees that are a part of that batch.

```apex
public static Decimal getAverageGrade(List<Decimal> grades)
```
This method takes a list of decimals and returns the average grade.

```apex
public static Map<String, Object> mapTraineesAndGrades(Id traineeID, List<Caliber_Grade__c> gradesList)
```
This method takes the trainee’s Id and a list of their grades. It Calculates the trainees average grade using the getAverageGrade utility function then maps their name and the average grade.

```apex
static Decimal getGradePercentage(Decimal score, Decimal maxScore)
```
This method takes a trainee’s score and the assessment’s max score and calculates the grade percentage.

```apex
public static List<Decimal> getAllGradeAveragesByCategory(List<Caliber_Grade__c> allData, String name)
```
This method takes a list of grades and the name of a category and returns a list of the grade averages for an assessment that has a matching category.

```apex
public static Decimal getAllGradeAveragesByWeek(List<Caliber_Grade__c> gradesList, Integer weekNum)
```
This method takes a list of grades and integer for the week and returns of the grade averages for the specified week.

```apex
public static Training__c getBatchById(Id batchId)
```
This method takes an Id and queries for the batch.

```apex
public static List<Caliber_Grade__c> getGradesForBatch(Id batchId)
```
This method takes a batch’s Id and returns the list of grades for that batch.

```apex
public static List<Caliber_Grade__c> getGradesForTraineeByWeek(Id traineeId, Integer WeekNum)
```
This method returns a list of a trainee’s grades taking into account the week the assessment was taken.

```apex
public static List<Caliber_Grade__c> getGradesForTrainee(Id traineeId)
```
This method returns a list of a trainee’s grades.

```apex
public static List<Caliber_Grade__c> getGradesForBatchAndWeek(Id batchId, Integer weekNum)
```
This method returns a batch’s grades for the specified week.


## Lightning Components and JavaScript Controllers/Helpers

#### BatchOverallQCTable Component:
This component is used to display the QC grade for each trainee and overall batch by week. On the component, the first column displays the trainee’s name, and under each week is a smiley which shows the QC grade that trainee had received for the given week. These rows are created using the BatchOverallQCTableRow component. The last row of the table displays the overall batch grades for each week. Each QC grade is represented by the smiley face. Clicking on each smiley face will display the QC note of each trainee or weekly QC note of the current batch in a popup modal. All the data provided to the controller is retrieved from ReportsController.getBatchOverallQCTable().

<i> BatchOverallQCTableHelper.js</i>

> <b>getWeeks()</b> <br/>
> Returns the list of weeks in the batch.

> <b>getTraineeNames()</b> <br/>
> Returns the list of trainees in the batch.
 
#### OverallReportTechSkillsRadar Component:
This component displays the technical skills of the batch overall and of trainees.  It dynamically updates when the report filters change.  When displaying overall data for a batch, the shown trainees can be changed.  The button for choosing the shown trainees is an icon from font awesome.  Data from the chart is retrieved from the Apex controller, parsed by the JavaScript controller, and rendered as a chart by Chart.js.  The table below the chart is a nested component.

#### OverallCumulativeScoresBarChart Component:
This component displays the cumulative grade for each student in a batch from highest to lowest. A benchmark is displayed when a batch but not a trainee or week is defined. Chart data is retrieved from an Apex controller, processed by the JavaScript controller, and rendered as a chart using Chart.js. 

<i> OverallCumulativeScoresBarChartHelper.js </i>

> <b>doServerRequest()</b> <br/>
> Sets the callback function to receive the report data from the Apex controller. Invokes different Apex method depending on criteria. Enqueues action.

> <b>configureCumulativeScoresChart()</b> <br/>
> Displays an error message if no data is returned. Sorts data and converts data into data that can be used by Chart.js. 

> <b>renderChart()</b> <br/>
> Renders data as a chart using Chart.js. Converts batch data into a usable dataset for the bar graph and the benchmark array as a usable dataset if valid. Retrieves the canvas element on the Lightning component and creates a bar chart in the element, inputting the batch and benchmark datasets.

> <b>test()</b> <br/>
> Used to generate data and test the configureCumulativeScoresChart and renderChart functions before integration.

#### OverallWeeklyProgressLineChart Component:
This component displays the grade of trainee or average grade of a batch over several weeks. If a trainee is specified in addition to a batch both progress lines are displayed. Chart data is retrieved from an Apex controller, processed by a JavaScript controller, and rendered as a chart using Chart.js.  

<i> OverallWeeklyProgressLineChartHelper.js </i>

> <b>doServerRequest()</b> <br/>
> Sets the callback function to receive the report data from the Apex controller. Invokes different Apex method depending on criteria. Enqueues action.

> <b>configureWeeklyProgressChart()</b> <br/>
> Displays an error message if no data is returned. Sorts data and converts data into data that can be used by Chart.js. 

> <b>renderChart()</b> <br/>
> Renders data as a chart using Chart.js. Converts valid data into datasets for Chart.js. Retrieves the canvas element on the Lightning component and creates a line chart in the element, inputting the different valid datasets as data to be rendered in the chart.

#### ReportsPageHeader Component:
This component holds the years, batches, weeks, and trainees filters for the reports page. Selecting a value in the filter will alert the chart components that the info needs to be updated.

<i> ReportsPageHeaderHelper.js </i>

> <b>getAllYears()</b> <br/>
> Sets a callback for the GetAllYearsWithBatches server side method. Takes the return value and populates the allYears and yearLabel attributes in the reportsPageHeader component. Then calls the getBatchesForYear function to initialize the batches attributes.

> <b>getBatchesForYear()</b> <br/>
> Sets the callback for the getBatchesByYear server side method and sets the year parameter with the value of the yearLabel attribute. Inside the callback the allBatches and currentBatch attributes are set and the buildBatchStrings function is called.

> <b>buildBatchStrings()</b> <br/>
> Sets the callback for the buildBatchStrings server side method. Sets the trainings parameter with the value of the allBatches attribute. Inside the callback the allBatchLabels and batchLabel attributes are set with an array of label, value pairs. Then the setCurrentBatch function is called. 

> <b>getWeeksForBatch()</b> <br/>
> Sets the callback for the batchWeeksStrings server side method and set the batch parameter with the value of the currentBatch attribute. Within the callback the allWeekLabels and weekLabel attributes are set.

> <b>getTraineesForBatch()</b> <br/>
> Sets the callback for the batchTrainees server side method and sets the batch parameter with the value of the currentBatch attribute. The allTrainees, currentTrainee, and currentTraineeName attributes are set inside the callback. The current trainee attributes default to all and null respectively. Then the fireReportFilterchange function is called.

> <b>getSelectedTrainee()</b> <br/>
> 

> <b>setCurrentBatch()</b> <br/>
> 

> <b>fireReportFilterChange()</b> <br/>
> 



## JSON format JavaScript controllers receive from Apex controllers
Cumulative Scores Bar Chart:
```javascript
// All Weeks & All Trainees (Overall)
{
    trainees : [{
            name : String,
            grade : Decimal
    }],
    benchmark : Decimal
}
```
```javascript
// Single Week & All Trainees
{
    trainees : [{
            name : String,
            grade : Decimal
    }]
}
```
Batch QC Report Table:
```javascript
// All Weeks & All Trainees (Overall)
{
    numOfWeeks : Integer,
    trainees : [{
        name : String,
        weeklyData : [{
		id : String,
        	grade : String,
        	note : String
        }]
    }],
    batchWeeklyData : [{
	    batchNotes : String,
    	batchGrades : String
    }]
}
```
Technical Skills Radar Chart:
```javascript
// All Weeks & All Trainees (Overall)
// All Weeks & Single Trainee
// Single Week & Single Trainee
{
    batch : {
        name : String,
        categories : [{
            name : String,
            grade : Decimal
        }]
    },
    trainees : [{
        name : String,
        categories : [{
            name : String,
            grade : Decimal
        }]
    }]
}
```
Weekly Progress Line Chart:
```javascript
// All Weeks & All Trainees (Overall)
{
    batch : [{
        week : Integer,
        grade : Decimal
    }]
}
```
```javascript
// All Weeks & Single Trainee
// Single Week & Single Trainee
{
    trainees : [{
        week : Integer,
        grade : Decimal
    }], 
    batch : [{
        week : Integer,
        grade : Decimal
    }]
}
```

Assessment Breakdown Bar Chart: 
```javascript
// Single Week & All Trainees
{
    batch : [{
        type : String,
        grade : Decimal
    }]
}
```
```javascript
// All Weeks & Single Trainee
// Single Week & Single Trainee
{
    batch : [{
        type : String,
        grade : Decimal
    }],
    trainees : [{
        type : String,
        grade : Decimal
    }]
}
```
Quality Audit Donut Chart:
```javascript
// Single Week & All Trainees
{
    superstar : Integer,
    good : Integer,
    average : Integer,
    poor : Integer
}
```
Quality Audit Report - Week Table:
```javascript
// Single Week & All Trainees
{
    categories : String[],
    trainees : [{
        name : String,
        feedback : String,
        notes : String
    }], 
    batch : {
        feedback : String,
        notes : String
    }
}
```
Overall Feedback Table:
```javascript
// All Weeks & Single Trainee
{
    week :[{
        week : Integer,
        category : String,
        qualityAudit : String,
        QCfeedback : String,
        trainerFeedback : String
    }]
}

```
Feedback for the Week Table:
```javascript
// Single Week & All Trainees
{
    categories : String[],
    assessments : String[],
    trainees : [{
        name : String,
        grades : Decimal[]
    }],
    notes : String
}
```
```javascript
// Single Week & Single Trainee
{
    categories : String[],
    trainerFeedback : String,
    qualityAudit : String,
    QCfeedback : String
}
```
