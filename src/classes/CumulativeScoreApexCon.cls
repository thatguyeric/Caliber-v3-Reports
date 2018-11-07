public class CumulativeScoreApexCon {

    @AuraEnabled
    public static List<Caliber_Grade__c> getCalGrades() {
        List<Caliber_Grade__c> calG = new List<Caliber_Grade__c>();
        calG = [SELECT Id, Contact__r.LastName, Contact__r.FirstName, Score__c FROM Caliber_Grade__c ORDER By Score__c DESC LIMIT 20];
        return calG;
    }
    
}