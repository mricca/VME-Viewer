<#if features?has_content>

	<div class="FeatureInfo vmeFeatureInfo">

		<#list features as feature>
		<!--	<h2> ${feature.fid}: </h2> -->
		   <h2 class="VME_ID" > ${feature.attributes["VME_ID"].value}: </h2>
		  <ul>
						<li><b>Geographic reference: </b>Northwest Atlantic</li> <#--  TODO -->
						<li><b>Local name: </b>Corner Rise Seamounts</li> <#--  TODO -->
						<li><b>Area: </b>VME</li> <#--  TODO -->
						<li><b>Status: </b>
							<#switch feature.attributes["STATUS"].value>
							  <#case "1">
								Established
								<#break>
							  <#case "2">
								 Under establishment
								 <#break>
							  <#case "3">
								 Risk
								 <#break>
							  <#case "4">
								 Voluntary
								 <#break>
							  <#case "5">
								 Exploratory
								 <#break>
							  <#case "6">
								 Potential
								 <#break>
							  <#case "7">
								 Temporary 
								 <#break>
							  <#default>
								 Unknown
								 <#break>
							</#switch>  
						</li>	
					<li><b>Validity period: </b>from 2007 up to 2014 </li> <#-- TODO -->
					<li><b>Reporting year: </b>${feature.attributes["YEAR"].value}</li> <#-- TODO -->
					<#--	<li><b>${attribute.name}:</b> <span class="${attribute.name}">${attribute.value}</span> -->
		  </ul>
			  <div class="links">
				<a href="http://www.fao.org/fishery/species/2525/en">link to factsheet</a><br />
				<a href="#" onclick="Ext.Msg.alert('Download','Download yet to be implemented')">Download VME Area coordinates</a>
				<hr/>
			</div>	
		</#list>
		
	</div>
	
</#if>
