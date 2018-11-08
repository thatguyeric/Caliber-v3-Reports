({
      doInit: function(component, event, helper) {
        // Fetch the account list from the Apex controller
        helper.getAccountList(component);
      },
      deleteAccount: function(component, event, helper) {
        // Prevent the form from getting submitted
        event.preventDefault();
        // Get the value from the field that's in the form
        var accountName = event.target.getElementsByClassName('account-name')[0].value;
        confirm('Delete the ' + accountName + ' account? (don’t worry, this won’t actually work!)');
      }
    })