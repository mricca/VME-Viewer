<#if features?has_content>
	<div class="FeatureInfo footprintsFeatureInfo">
		<#list features as feature>
		<!--	<h2> ${feature.fid}: </h2> -->
		  <#-- <h2 class="VME_ID" > ${feature.attributes["VME_ID"].value}:  -->
		  <h2>${feature.attributes["VME_ID"].value} bottom fishing areas ("footprint") </h2> <#-- TODO -->		  
		  <ul>
				 <li><b>Latest reference year: </b><span>${feature.attributes["YEAR"].value}</span></li>
		  </ul>
		  <div class="links">
			<a href="#" onclick="Ext.Msg.alert('Download','Download yet to be implemented')">Download VME Area coordinates</a>
		</div>
		<hr/>
		</#list>
		
	</div>
</#if>