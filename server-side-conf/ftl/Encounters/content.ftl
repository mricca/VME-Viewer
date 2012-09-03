<#if features?has_content>
	<div class="FeatureInfo footprintsFeatureInfo">
		<#list features as feature>
		<!--	<h2> ${feature.fid}: </h2> -->
		  <h2> ${feature.attributes["ID"].value }: </h2>
		  <ul>
				<li><b>VME ID: </b>${feature.attributes["VME_ID"].value}</li> <#-- TODO -->
			  	<li><b>Reporting year: </b>${feature.attributes["YEAR"].value}</li> <#-- TODO -->
				<li><b>Taxa: </b>${feature.attributes["TAXA"].value}</li> <#-- TODO -->
				<li><b>Quantity: </b>${feature.attributes["QUANTITY"].value} ${feature.attributes["UNIT"].value}</li> <#-- TODO -->
		  </ul>
		  <div class="links">
			<a href="#" onclick="Ext.Msg.alert('Download','Download yet to be implemented')">Download VME Area coordinates</a>
		</div>
		<hr/>
		</#list>
		
	</div>
</#if>