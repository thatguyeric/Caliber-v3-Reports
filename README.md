# Caliber-v3-Reports

Docs for Chart.js: http://www.chartjs.org/docs/latest/

### Getting your org connected with Git:
<ol>
  <li> Create a Developer Edition org. and reset your token:  </li>
    <ol>
      <li> Click on your org profile icon</li>
      <li> Select settings </li>
      <li> Click Reset My Security Token in the left-hand side panel </li>
    </ol>
  <li> Download the unmanaged package from here: https://login.salesforce.com/packaging/installPackage.apexp?p0=04tf20000003QrF. </li>
  <li> Clone the Caliber-v3-Reports repository to your local machine. </li>
  <li> Create a Force.com project <b>in the same directory</b> that your cloned repository is located in. </li>
  <li> The Force.com project name MUST be: Caliber-v3-Reports (Use your Developer Edition org's credentials to create the project)</li>
  <li> Choose Initial Project Contents: Select <b>NONE</b></li>
  <li> Error might be thrown, just check to make sure that it was created correctly. </li>
  <li> Open git bash in your project's directory and create your branch. </li>
  <ol>
    <li> git branch <i>branch_name</i> </li>
    <li> git checkout <i>branch_name</i> </li>
    <li> git branch --set-upstream-to=origin/master <i>branch_name</i> </li>
  </ol>
</ol>
  
Make sure all changes are made in your branch.  <br/>
To update your org with changes made in your Force.com IDE, right click <i>Caliber-v3-Reports folder > Force.com > Deploy to Server</i>

<br/>
<br/>
