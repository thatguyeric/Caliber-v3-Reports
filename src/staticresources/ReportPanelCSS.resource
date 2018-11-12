@font-face {
    font-family: 'Futura-Std-Medium';
    src: url('../FuturaStdMediumOTF') format('opentype');
}

@font-face {
    font-family: 'Futura-Std-Book';
    src: url('../FuturaStdBookOTF') format('opentype');
}

@font-face {
    font-family: 'Futura-Std-Heavy';
    src: url('../FuturaStdHeavyOTF') format('opentype');
}

@font-face {
    font-family: 'Futura-Std-Bold';
    src: url('../FuturaStdBoldOTF') format('opentype');
}

* {    
    font-family: 'Futura-Std-Book';
    font-size: 14px;
}

.card>.card-header {
    background-color: #F26925;
    color: #FFFFFF;
}

.card {
    margin-bottom: 20px;
}

.col {
    padding: 0px;
}

.report-43 {
    width: 43%;
    float:left;
}

.report-55 {
    width: 55%;
    float:right;
}


.report-100 {
    width: 100%;
}

@media screen and (max-width:1000px) {
    .radar-report, .line-chart {
        width:100%; /* The width is 100%, when the viewport is 800px or smaller */
    }
}