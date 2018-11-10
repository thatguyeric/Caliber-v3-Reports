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

.report-panel {
    display: flex;
    flex-direction: column;
    border: 1px solid #B9B9BA;  /* Revature Secondary Color Light Grey */
    border-radius: 4px;
    margin-bottom: 20px;
}

.report-panel-header {
    background-color: #F26925;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    padding: 10px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.report-panel-body {
    padding: 15px;
}

.report-panel-header-title {
    color: #FFFFFF;
}