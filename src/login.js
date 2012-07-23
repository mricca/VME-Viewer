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
	
	//
	//Login window
	//
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
	
	/**
	 * logInOut toggles login/logout status
	 */
	FigisMap.logInOut = function(){
		if(FigisMap.rnd.status.logged){
			//logout
			Ext.Msg.show({
			   title:'Logout',
			   msg: 'Are you sure that you want to logout?',
			   buttons: Ext.Msg.YESNO,
			   fn: function(btn ){
					if(btn != 'yes') return;
					FigisMap.rnd.status.logged=false;
					//reset previous fields values
					FigisMap.loginWin.userField.setValue("");
					FigisMap.loginWin.passwordField.setValue("");
					//change login link look
					Ext.DomHelper.overwrite(document.getElementById("user"),{
						tag:'span',
						id:'user',
						class:'user-logout',
						html:'<a onclick="FigisMap.logInOut()">Login</a>'
				});
				FigisMap.loginWin.fireEvent('logout');
				},
			   animEl: 'elId',
			   icon: Ext.MessageBox.QUESTION
			});
			
		}else{
			//login prompt
			FigisMap.loginWin.show();
		}
	};
	
	//add events login and logout
	FigisMap.loginWin.addEvents(FigisMap.loginWin.events);
	
	// This function checks the user/password
	FigisMap.submitLogin = function () {
			var w=FigisMap.loginWin;
			//that's only an exemple
			var user = w.userField.getValue();
			var password = w.passwordField.getValue();
			if(user =="admin" && password =="admin"){
				FigisMap.rnd.status.logged = true;
				//change login link
				Ext.DomHelper.overwrite(document.getElementById("user"),{
					tag:'span',
					id:'user',
					class:'user-logout',
					html:'You Are Logged as  <em>'+ user + ' </em> <a onclick="FigisMap.logInOut()">Logout</a>'
				});
				//fires event login
				w.fireEvent('login',user);
				//hide window
				w.hide();
			}else{
				
				Ext.Msg.show({
				   title:'Login Error',
				   msg: 'The username or password is not correct.',
				   buttons: Ext.Msg.OK,
				   icon: Ext.MessageBox.ERROR
				});
				w.userField.markInvalid();
				w.passwordField.markInvalid();			
			}
	};
	
	//setup login link
	Ext.DomHelper.overwrite(document.getElementById("user"),{
				tag:'span',
				id:'user',
				class:'user-logout',
				html:'<a onclick="FigisMap.logInOut()">Login</a>'
			});
});
 
