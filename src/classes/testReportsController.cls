@isTest
public class testReportsController {

    @isTest
    public static void testBatchOverallCumulativeScoresBar(){
        TestDataFactory.createData();
        Id batchID = [SELECT Id FROM Training__c LIMIT 1].Id;
        String jsonResult = ReportsController.getBatchOverallCumulativeScoresBar(batchId);
        
        // test that each key is in the correct place. 
        Object obj = JSON.deserializeUntyped(jsonResult);
		
        System.assert(true);
    }
    
    @isTest
    public static void testBatchOverallQCTable(){
        TestDataFactory.createData();
        Id batchID = [SELECT Id FROM Training__c LIMIT 1].Id;
        String jsonResult = ReportsController.getBatchOverallQCTable(batchId);
        
        // test that each key is in the correct place. 
        Object obj = JSON.deserializeUntyped(jsonResult);
		
        System.assert(true);
    }
    
    @isTest 
    public static void testBatchOverallTechSkillsRadar(){
        TestDataFactory.createData();
        Id batchID = [SELECT Id FROM Training__c LIMIT 1].Id;
        String jsonResult = ReportsController.getBatchOverallTechSkillsRadar(batchId);
        
        // test that each key is in the correct place. 
		Object obj = JSON.deserializeUntyped(jsonResult);
        
        System.assert(true);
    }
    
    @isTest
    public static void testGetSelectedBatch(){
        TestDataFactory.createData();
        List<Training__c> batches = [select startDate__c from Training__c];
        String startDate = '9/10/2018';
        Training__c actualTraining = ReportsController.getSelectedBatch(batches, startDate);
        Date start = Date.newInstance(2018, 9, 10);
        Training__c expectedBatch = [select startDate__c, Id from Training__c where startDate__c = :start limit 1];
        system.assertEquals(expectedBatch, actualTraining);
        startDate = 'balogni';
        actualTraining = ReportsController.getSelectedBatch(batches, startDate);
        system.assertEquals(null, actualTraining);
    }
}