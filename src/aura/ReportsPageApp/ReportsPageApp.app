<aura:application extends="force:slds">
    <div class="container" style="background-color:white;">
        <c:reportsPageHeader></c:reportsPageHeader>
        <div style="height:600px;">
            <c:CumulativeScoresBarChart/>
        </div>
        <c:BatchOverallQCTable />
        <c:WeeklyProgressLineChart/>
    </div>
    
    <div style="height:100px"/>
</aura:application>