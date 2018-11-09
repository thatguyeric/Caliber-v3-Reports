public class TechnicalSkillsApexCon {
    
    @AuraEnabled
    public static List<Caliber_Assessment__c> getCalCat() {
        List<Caliber_Assessment__c> calCat = new List<Caliber_Assessment__c>();
        calCat = [SELECT Id, Assessment_Category__r.Name FROM Caliber_Assessment__c];
        return calCat;
    }
    
    @AuraEnabled
    public static Training__c getCurrentBatch(Id batchId) {
        return [SELECT Id, TrainingClass__c FROM Training__c WHERE Id = :batchId LIMIT 1];
    }
    
}