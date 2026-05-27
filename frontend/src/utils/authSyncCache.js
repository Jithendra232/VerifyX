/**
 * Deduplicates MongoDB user sync across components (single in-flight request per Clerk user).
 */
let cachedUserId = null;
let cachedMongoUser = null;
let inflightSync = null;

export const getCachedMongoUser = () => cachedMongoUser;

export const clearAuthSyncCache = () => {
  cachedUserId = null;
  cachedMongoUser = null;
  inflightSync = null;
};

export const syncMongoUserOnce = async (user, syncFn) => {
  if (!user?.id) {
    clearAuthSyncCache();
    return null;
  }

  if (cachedUserId && cachedUserId !== user.id) {
    clearAuthSyncCache();
  }

  if (cachedUserId === user.id && cachedMongoUser) {
    return cachedMongoUser;
  }

  if (inflightSync && cachedUserId === user.id) {
    return inflightSync;
  }

  cachedUserId = user.id;

  inflightSync = syncFn()
    .then((data) => {
      cachedMongoUser = data;
      return data;
    })
    .catch((error) => {
      cachedMongoUser = null;
      throw error;
    })
    .finally(() => {
      inflightSync = null;
    });

  return inflightSync;
};
