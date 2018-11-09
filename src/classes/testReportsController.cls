@isTest
public class testReportsController {

    @testSetup
    public static void setup(){
        TestDataFactory.createData();
    }
    
    @isTest
    public static void testBatchOverallQCTable(){
        Id batchID = [SELECT Id FROM Training__c LIMIT 1].Id;
        String expectedJson = '{"batchNotes":["good job on week 0","good job on week 1","good job on week 2","good job on week 3","good job on week 4"],"batchGrades":["Good","Good","Good","Good","Good"],"trainee":[{"notes":["good job on week 0","good job on week 1","good job on week 2","good job on week 3","good job on week 4"],"grades":["Good","Good","Good","Good","Good"],"name":"Duck, Donald"},{"notes":["good job on week 0","good job on week 1","good job on week 2","good job on week 3","good job on week 4"],"grades":["Good","Good","Good","Good","Good"],"name":"Mouse, Mickey"},{"notes":["good job on week 0","good job on week 1","good job on week 2","good job on week 3","good job on week 4"],"grades":["Good","Good","Good","Good","Good"],"name":"Duck, Daisy"},{"notes":["good job on week 0","good job on week 1","good job on week 2","good job on week 3","good job on week 4"],"grades":["Good","Good","Good","Good","Good"],"name":"Goofy, Goofy"},{"notes":["good job on week 0","good job on week 1","good job on week 2","good job on week 3","good job on week 4"],"grades":["Good","Good","Good","Good","Good"],"name":"Mouse, Minnie"}],"numOfWeeks":5}';
        String jsonResult = ReportsController.getBatchOverallQCTable(batchId);
        System.assertEquals(expectedJson, jsonResult);
    }
    
    @isTest 
    public static void testBatchOverallTechSkillsRadar(){
        Id batchID = [SELECT Id FROM Training__c LIMIT 1].Id;
        String expectedJson = '';
        String jsonResult = ReportsController.getBatchOverallTechSkillsRadar(batchId);
        System.assertEquals(expectedJson, jsonResult);
    }
    
}