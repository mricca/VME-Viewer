/**
 * Login Widget and button.
 * Author: Lorenzo Natali (GeoSolutions S.A.S.)
 * 
 *
 */

Ext.onReady(function(){
	//status variable,
	FigisMap.rnd.status = {
		logged : false
	};
	FigisMap.loginWin= new Ext.Window({
		width: 250,
		title: "Login",
		closeAction: 'hide',
		modal: true,
		items:[{
			xtype: 'form',
			ref: 'form',
			bodyStyle:{
				padding: "10px",
				
			},
			items:[
			{
				ref: '../userField',
				xtype: 'textfield',
				fieldLabel: 'User',
				width: 100
			
			},{
				ref: '../passwordField',
				xtype: 'textfield',
				fieldLabel: 'Password',
				inputType: 'password',
				width: 100
			}	
			]
			
		}],
		 buttons: [
		 {
			text:'Login',
			ref: '../loginButton',
			iconCls: 'icon-login',
			handler: function(){
				FigisMap.submitLogin()
			}
		}],
        keys: [{ 
            key: [Ext.EventObject.ENTER],
            scope: this,
            handler: function(){
            	FigisMap.submitLogin()
        	}
        }],
		events:{
			login:true,logout:true
		
		}
	});
	FigisMap.loginButton = new Ext.Button({
			text: 'Login',
			iconCls: 'icon-login',
			renderTo: 'loginButton',
			
			handler:function(){
				if(FigisMap.rnd.status.logged){
					FigisMap.rnd.status.logged=false;
					FigisMap.loginButton.setIconClass("icon-login");
					//reset previous fields values
					FigisMap.loginWin.userField.setValue("");
					FigisMap.loginWin.passwordField.setValue("");
					//change login button look
					FigisMap.loginButton.setText("Login");
					FigisMap.loginWin.fireEvent('logout');
				}else{
					FigisMap.loginWin.show();
				}
			}
	});
	FigisMap.loginWin.addEvents(FigisMap.loginWin.events);
	FigisMap.submitLogin = function () {
			var w=FigisMap.loginWin;
			//that's only an exemple
			var user = w.userField.getValue();
			var password = w.passwordField.getValue();
			if(user =="admin" && password =="admin"){
				FigisMap.rnd.status.logged = true;
				FigisMap.loginButton.setText("Logout");
				FigisMap.loginButton.setIconClass("icon-logout");
				w.fireEvent('login',user);
				w.hide();
			}else{
				w.userField.markInvalid();
				w.passwordField.markInvalid();			
			}
	};
});
 
