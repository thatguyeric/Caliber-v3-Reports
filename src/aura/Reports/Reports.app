<aura:application extends="force:slds">
    <ltng:require
                  styles="{!join(',',$Resource.ReportPanelCSS, $Resource.bootstrapCSS)}"
                  scripts="{!join(',', $Resource.jQuery, $Resource.bootstrapJS)}"/>
    <div class="container" style="width: 100%">
        <c:reportsPageHeader/>
        <div class="row">
            <!-- TODO: add Cumulative Score Chart here -->
            <c:CumulativeScoreTable/>
        </div>
        <div class="row">
            <c:BatchOverallQCTable/>
        </div>
        <div class="row">
            
                <c:ReportTechSkillsRadar/>
            </div>
            <div class="col report-55">
                <!-- TODO: add weekly progress chart here -->
            </div>
        </div>
    
</aura:application>