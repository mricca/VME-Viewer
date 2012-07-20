Ext.onReady(function(){
	FigisMap.rnd.status = {
		logged : false
	};
	FigisMap.loginWin= new Ext.Window({
		width: 250,
		title: "Login",
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
				var w=FigisMap.loginWin;
				//thats only an exemple
				var user = w.userField.getValue();
				var password = w.passwordField.getValue();
				if(user =="admin" && password =="admin"){
					FigisMap.rnd.status.logged = true;
					FigisMap.loginButton.setText("Logout");
					FigisMap.loginButton.setIconClass("icon-logout");
					w.hide();
				}else{
					w.userField.markInvalid();
					w.passwordField.markInvalid();
					
				}
				
			}
		},{
			text: 'Close',
			ref: '../closeButton',
			iconCls: 'icon-cancel',
			handler: function(){
				FigisMap.loginWin.hide();
			}
		}]

			
		
	});
	FigisMap.loginButton = new Ext.Button({
			text: 'Login',
			iconCls: 'icon-login',
			renderTo: 'loginButton',
			handler:function(){
				if(FigisMap.rnd.status.logged){
					FigisMap.rnd.status.logged=false;
					FigisMap.loginButton.setIconClass("icon-login");
					FigisMap.loginWin.userField.setValue("");
					FigisMap.loginWin.passwordField.setValue("");
					FigisMap.loginButton.setText("Login");
				}else{
					FigisMap.loginWin.show();
				}
			}
	});
});
