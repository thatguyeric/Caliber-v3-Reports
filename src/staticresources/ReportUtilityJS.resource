window._CaliberReportChartJSDatasetColors = (function() {
    var colors = [
        {r: 114, g: 164, b: 194}, /* Revature Secondary Color Blue */
        {r: 252, g: 180, b: 20}, /* Revature Secondary Color Yellow */
        {r: 71, g: 76, b: 85} /* Revature Primary Color Dark Grey */
    ];
    var backgroundColorAlpha = 0.5;
    var borderColorAlpha = 1.0;
    var hoverColorAlpha = 0.3;
    
    function colorToString(rgb, alpha) {
        return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha;
    }
    
    function randomColorValue() {
        return Math.floor(Math.random() * 256);
    }
    
    return {
        put : function(chartJSDataset, chartType, colorIndex) {
            if (colorIndex >= colors.length) {
                //TODO: add a new color
                colors.push({
                    r: randomColorValue(),
                    g: randomColorValue(),
                    b: randomColorValue()
                });
            }
            //TODO: support more chart types
            chartJSDataset.backgroundColor = colorToString(colors[colorIndex], backgroundColorAlpha);
            chartJSDataset.pointBackgroundColor = colorToString(colors[colorIndex], backgroundColorAlpha);
            chartJSDataset.borderColor = colorToString(colors[colorIndex], borderColorAlpha);
            chartJSDataset.pointHoverBackgroundColor = colorToString(colors[colorIndex], hoverColorAlpha);
            chartJSDataset.pointHoverBorderColor = colorToString(colors[colorIndex], hoverColorAlpha);
            chartJSDataset.pointBorderColor = '#FFF';
            // radar chart should only use fill for batch overall, which we assume to use color index 0
            chartJSDataset.fill = colorIndex === 0;
        }
    };
}());