public class TechnicalSkillsApexCon {
    
    @AuraEnabled
    public static Training__c getCurrentBatch(Id batchId) {
        return [SELECT Id, TrainingClass__c FROM Training__c WHERE Id = :batchId LIMIT 1];
    }
    
    @AuraEnabled
    public static List<Caliber_Assessment__c> getCalCat(Id batchId) {
        List<Caliber_Assessment__c> calCat = new List<Caliber_Assessment__c>();
        calCat = [SELECT Assessment_Category__r.Name FROM Caliber_Assessment__c WHERE Training_Id__r.Id = :batchId];
        return calCat;
    
    }
    
}