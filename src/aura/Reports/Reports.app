<aura:application extends="force:slds">
    <ltng:require
                  styles="{!join(',',$Resource.ReportPanelCSS, $Resource.bootstrapCSS)}"
                  scripts="{!join(',', $Resource.jQuery, $Resource.bootstrapJS)}"/>
    <div class="container" style="width: 100%">
        <c:reportsPageHeader/>
        
     
            <c:CumulativeScoresBarChart/>
        
        
        
            <c:BatchOverallQCTable/>
        
       
        
        
        <c:ReportTechSkillsRadar/>
        
        <c:WeeklyProgressLineChart/>
        
        
    </div>
</aura:application>