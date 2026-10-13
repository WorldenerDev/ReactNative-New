#import <React/RCTBridgeModule.h>
#import <Security/Security.h>

static NSString *const kAppGroup = @"group.live.worldener.app";
static NSString *const kKeychainService = @"live.worldener.app.auth";
static NSString *const kKeychainAccount = @"token";
static NSString *const kAccessGroup = @"S97YTUR98S.live.worldener.shared";

@interface SharedAuth : NSObject <RCTBridgeModule>
@end

@implementation SharedAuth

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (NSDictionary *)keychainQuery
{
  return @{
    (__bridge id)kSecClass : (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrService : kKeychainService,
    (__bridge id)kSecAttrAccount : kKeychainAccount,
    (__bridge id)kSecAttrAccessGroup : kAccessGroup,
  };
}

- (NSUserDefaults *)sharedDefaults
{
  return [[NSUserDefaults alloc] initWithSuiteName:kAppGroup];
}

RCT_EXPORT_METHOD(setSession:(NSString *)token apiBaseUrl:(NSString *)apiBaseUrl)
{
  NSMutableDictionary *query = [[self keychainQuery] mutableCopy];
  SecItemDelete((__bridge CFDictionaryRef)query);
  if (token.length > 0) {
    query[(__bridge id)kSecValueData] = [token dataUsingEncoding:NSUTF8StringEncoding];
    query[(__bridge id)kSecAttrAccessible] = (__bridge id)kSecAttrAccessibleAfterFirstUnlock;
    SecItemAdd((__bridge CFDictionaryRef)query, NULL);
  }
  NSUserDefaults *defaults = [self sharedDefaults];
  if (apiBaseUrl.length > 0) {
    [defaults setObject:apiBaseUrl forKey:@"apiBaseUrl"];
  }
}

RCT_EXPORT_METHOD(clearSession)
{
  NSDictionary *query = [self keychainQuery];
  SecItemDelete((__bridge CFDictionaryRef)query);
  NSUserDefaults *defaults = [self sharedDefaults];
  [defaults removeObjectForKey:@"apiBaseUrl"];
}

RCT_EXPORT_METHOD(consumePendingShare:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSUserDefaults *defaults = [self sharedDefaults];
  NSString *url = [defaults stringForKey:@"pendingShareUrl"] ?: @"";
  NSString *action = [defaults stringForKey:@"pendingShareAction"] ?: @"";
  NSString *tripId = [defaults stringForKey:@"pendingTripId"] ?: @"";
  [defaults removeObjectForKey:@"pendingShareUrl"];
  [defaults removeObjectForKey:@"pendingShareAction"];
  [defaults removeObjectForKey:@"pendingTripId"];
  if (url.length == 0 && tripId.length == 0) {
    NSString *inbound = [[NSUserDefaults standardUserDefaults] stringForKey:@"worldenerInboundURL"];
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"worldenerInboundURL"];
    if (inbound.length > 0) {
      url = inbound;
    }
  } else {
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"worldenerInboundURL"];
  }
  if (url.length == 0 && tripId.length == 0) {
    resolve(nil);
    return;
  }
  resolve(@{
    @"url" : url,
    @"action" : action.length ? action : @"save",
    @"tripId" : tripId,
  });
}

@end
