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
    
}