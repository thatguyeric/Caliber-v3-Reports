<aura:application extends="force:slds">
    <ltng:require
                  styles="{!join(',',$Resource.ReportPanelCSS, $Resource.bootstrapCSS)}"
                  scripts="{!join(',', $Resource.jQuery, $Resource.bootstrapJS)}"/>
    <div class="container" style="width: 100%">
        <c:reportsPageHeader/>
        <br/>
        <div class="row">
            <c:CumulativeScoresBarChart/>
        </div>
        <br/>
        <div class="row">
            <c:BatchOverallQCTable/>
        </div>
        <br/>
        <div class="row">
            
                <c:ReportTechSkillsRadar/>

                <c:WeeklyProgressLineChart/>
            
        </div>
    </div>
</aura:application>