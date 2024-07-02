import { AskResponse, askConfigGetApplicationInfo, askConfigGetGlobal } from 'quidproquo-core';
import { FederationManifestUrl, ManifestServiceUrlDefinition, QPQConfigAdvancedLogSettings } from '../../../../config';

function isManifestServiceUrlDefinition(manifestUrl: ManifestServiceUrlDefinition | string): manifestUrl is ManifestServiceUrlDefinition {
  return !!manifestUrl && typeof manifestUrl !== 'string';
}

function* askConvertManifestServiceUrlDefinitionToUrl(def: ManifestServiceUrlDefinition): AskResponse<string> {
  const appInfo = yield* askConfigGetApplicationInfo();

  // TODO: get service domain here when def.domain is undefined.
  let domain = `${appInfo.environment}.${def.domain}`;
  if (appInfo.feature) {
    domain = `${appInfo.feature}.${domain}`;
  }

  if (def.service) {
    domain = `${def.service}.${domain}`;
  }

  if (def.api) {
    domain = `${def.api}.${domain}`;
  }

  return `${def.protocol}://${domain}${def.path}`;
}

export function* askGetFederationManifestUrl(): AskResponse<string> {
  const manifestUrl = yield* askConfigGetGlobal<FederationManifestUrl | undefined>('qpq-federationManifestUrl');

  if (!manifestUrl) {
    return '';
  }

  if (isManifestServiceUrlDefinition(manifestUrl)) {
    return yield* askConvertManifestServiceUrlDefinitionToUrl(manifestUrl);
  }

  return manifestUrl;
}
