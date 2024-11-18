targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Relative Path of ASA API gateway app Jar')
param gatewayRelativePath string

@description('Relative Path of ASA admin server app Jar')
param adminRelativePath string

@description('Relative Path of ASA customers service app Jar')
param customersRelativePath string

@description('Relative Path of ASA vets service app Jar')
param vetsRelativePath string

@description('Relative Path of ASA visits service app Jar')
param visitsRelativePath string

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var asaInstanceName = '${abbrs.springApps}${resourceToken}'
var gatewayAppName = 'api-gateway'
var adminAppName = 'admin-server'
var customersAppName = 'customers-service'
var vetsAppName = 'vets-service'
var visitsAppName = 'visits-service'
var tags = {
  'azd-env-name': environmentName
  'spring-cloud-azure': 'true'
}

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

module springApps 'modules/springapps/springapps.bicep' = {
  name: '${deployment().name}--asa'
  scope: resourceGroup(rg.name)
  params: {
    location: location
	gatewayAppName: gatewayAppName
	adminAppName: adminAppName
	customersAppName: customersAppName
	vetsAppName: vetsAppName
	visitsAppName: visitsAppName
	tags: tags
	asaInstanceName: asaInstanceName
	gatewayRelativePath: gatewayRelativePath
	adminRelativePath: adminRelativePath
	customersRelativePath: customersRelativePath
	vetsRelativePath: vetsRelativePath
	visitsRelativePath: visitsRelativePath
  }
}

output ASA_INSTANCE_NAME string = '${asaInstanceName}'