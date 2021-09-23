var KomBeaClient = Object.freeze(
{
	PROTOCALL	: 0,
	SECURECALL	: 1,
	EXACTCALL	: 2
});

var MessagingChannel = Object.freeze(
{
	PROTOCALL	: "9980",
	SECURECALL	: "9981",
	EXACTCALL	: "9982"
});

function KomBeaMessaging() 
{
	this.Client = KomBeaClient.PROTOCALL;
	
	this.Message = 
	{
		CMD : "START",
		SETTINGS : 
		{
			"StartPage" : 0,
			"AutoInvoke" : false,
			"WindowXPos" : -1,
			"WindowYPos" : -1 
		},
		DATA : {}
	};
	
	this.Reset = function() 
	{
		this.Message.CMD = "START";
		this.Message.SETTINGS.StartPage = 0;
		this.Message.SETTINGS.AutoInvoke = false;
		this.Message.SETTINGS.WindowXPos = -1;
		this.Message.SETTINGS.WindowYPos = -1;
		this.Message.DATA = {};
	};
	
	this.SetStartPage = function(n)
	{
		this.Message.SETTINGS.StartPage = n;
	};
	
	this.SetAutoInvoke = function(b)
	{
		this.Message.SETTINGS.AutoInvoke = b;
	};
	
	this.SetWindowXPos = function(x)
	{
		this.Message.SETTINGS.WindowXPos = x;
	};

	this.SetWindowYPos = function(y)
	{
		this.Message.SETTINGS.WindowYPos = y;
	};

	this.SetDataField = function(name, value) 
	{
		if (isNaN(name)) 
		{
			this.Message.DATA["IN_DF@" + name] = value;
		} 
		else 
		{
			this.Message.DATA["IN_DF#" + name] = value;
		}
	};
	
	this.SetDataFields = function(dataFields) 
	{
		for (var df in dataFields) 
		{
			if (isNaN(df)) 
			{
				this.Message.DATA["IN_DF@" + df] = dataFields[df];
			} 
			else 
			{
				this.Message.DATA["IN_DF#" + df] = dataFields[df];
			}	
		}
	};
	
	this.GetDataField = function(dataField) 
	{
		if (isNaN(dataField)) 
		{
			this.Message.DATA["OUT_DF@" + dataField] = "";
		} 
		else 
		{
			this.Message.DATA["OUT_DF#" + dataField] = "";
		}
	};
	
	this.GetDataFields = function(dataFields) 
	{
		for (var i in dataFields) 
		{
			if (isNaN(dataFields[i])) 
			{
				this.Message.DATA["OUT_DF@" + dataFields[i]] = "";
			} 
			else 
			{
				this.Message.DATA["OUT_DF#" + dataFields[i]] = "";
			}
		}
	};
	
	this.Start = function()
	{
		if ("WebSocket" in window)
		{	
			var km = this;
			
			var wsPath = "ws://127.0.0.1:";
			switch (this.Client)
			{
				case KomBeaClient.PROTOCALL :
					wsPath += MessagingChannel.PROTOCALL;
					break;
				case KomBeaClient.SECURECALL :
					wsPath += MessagingChannel.SECURECALL;
					break;
				case KomBeaClient.EXACTCALL :
					wsPath += MessagingChannel.EXACTCALL;
					break;
			}
			wsPath += "/ws";
					
			var ws = new WebSocket(wsPath);
			ws.onopen = function() 
			{
				var msg = JSON.stringify(km.Message);
				//alert(msg);
				ws.send(msg);
			};
						
			ws.onmessage = function(evt)
			{
				//alert(evt.data);
				var msg = JSON.parse(evt.data);
				if (msg.CMD === "ENDPROCESS") 
				{
					var dataFields = {};
					for (var name in msg.DATA) 
					{
						dataFields[name.substr(7)] = msg.DATA[name];
					}
						
					if (SC_OnFinish) 
					{
						SC_OnFinish(dataFields);
					}
				}
				ws.close();      
			};    
							
			ws.onclose = function()
			{
				//alert("WebSocket closed.");
			};  
		}  
		else  
		{	
			alert("This browser does not support WebSockets.");  
		}
	};
}