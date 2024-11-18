param asaInstanceName string
param gatewayAppName string
param adminAppName string
param customersAppName string
param vetsAppName string
param visitsAppName string
param location string = resourceGroup().location
param tags object = {}
param gatewayRelativePath string
param adminRelativePath string
param customersRelativePath string
param vetsRelativePath string
param visitsRelativePath string

resource asaInstance 'Microsoft.AppPlatform/Spring@2022-12-01' = {
  name: asaInstanceName
  location: location
  tags: tags
  sku: {
      name: 'S0'
      tier: 'Standard'
  }
}

resource asaConfigServer 'Microsoft.AppPlatform/Spring/configServers@2022-12-01' = {
  name: 'default'
  parent: asaInstance
  properties: {
    configServer: {
      gitProperty: {
        label: 'master'
        uri: 'https://github.com/azure-samples/spring-petclinic-microservices-config'
      }
    }
  }
}

resource gatewayApp 'Microsoft.AppPlatform/Spring/apps@2022-12-01' = {
  name: gatewayAppName
  location: location
  parent: asaInstance
  properties: {
    public: true
  }
}

resource adminApp 'Microsoft.AppPlatform/Spring/apps@2022-12-01' = {
  name: adminAppName
  location: location
  parent: asaInstance
  properties: {
    public: true
  }
}

resource customersApp 'Microsoft.AppPlatform/Spring/apps@2022-12-01' = {
  name: customersAppName
  location: location
  parent: asaInstance
  properties: {
    public: false
  }
}

resource vetsApp 'Microsoft.AppPlatform/Spring/apps@2022-12-01' = {
  name: vetsAppName
  location: location
  parent: asaInstance
  properties: {
    public: false
  }
}

resource visitsApp 'Microsoft.AppPlatform/Spring/apps@2022-12-01' = {
  name: visitsAppName
  location: location
  parent: asaInstance
  properties: {
    public: false
  }
}

resource gatewayDeployment 'Microsoft.AppPlatform/Spring/apps/deployments@2022-12-01' = {
  name: 'default'
  parent: gatewayApp
  properties: {
    deploymentSettings: {
      resourceRequests: {
        cpu: '1'
        memory: '2Gi'
      }
    }
    source: {
      type: 'Jar'
      jvmOptions: '-Xms2048m -Xmx2048m'
      runtimeVersion: 'Java_17'
      relativePath: gatewayRelativePath
    }
  }
}

resource adminDeployment 'Microsoft.AppPlatform/Spring/apps/deployments@2022-12-01' = {
  name: 'default'
  parent: adminApp
  properties: {
    deploymentSettings: {
      resourceRequests: {
        cpu: '1'
        memory: '2Gi'
      }
    }
    source: {
      type: 'Jar'
      jvmOptions: '-Xms2048m -Xmx2048m'
      runtimeVersion: 'Java_17'
      relativePath: adminRelativePath
    }
  }
}

resource customersDeployment 'Microsoft.AppPlatform/Spring/apps/deployments@2022-12-01' = {
  name: 'default'
  parent: customersApp
  properties: {
    deploymentSettings: {
      resourceRequests: {
        cpu: '1'
        memory: '2Gi'
      }
    }
    source: {
      type: 'Jar'
      jvmOptions: '-Xms2048m -Xmx2048m'
      runtimeVersion: 'Java_17'
      relativePath: customersRelativePath
    }
  }
}

resource vetsDeployment 'Microsoft.AppPlatform/Spring/apps/deployments@2022-12-01' = {
  name: 'default'
  parent: vetsApp
  properties: {
    deploymentSettings: {
      resourceRequests: {
        cpu: '1'
        memory: '2Gi'
      }
    }
    source: {
      type: 'Jar'
      jvmOptions: '-Xms2048m -Xmx2048m'
      runtimeVersion: 'Java_17'
      relativePath: vetsRelativePath
    }
  }
}

resource visitsDeployment 'Microsoft.AppPlatform/Spring/apps/deployments@2022-12-01' = {
  name: 'default'
  parent: visitsApp
  properties: {
    deploymentSettings: {
      resourceRequests: {
        cpu: '1'
        memory: '2Gi'
      }
    }
    source: {
      type: 'Jar'
      jvmOptions: '-Xms2048m -Xmx2048m'
      runtimeVersion: 'Java_17'
      relativePath: visitsRelativePath
    }
  }
}
