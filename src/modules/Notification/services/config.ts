export const config = {
  OTHER_USERS: {
    BIRTHDAY: {
      title: 'Today is {name} 🎉',
      description: `Don't miss to celebrate with us!`,
    },
    ANNIVERSARY: {
      title: 'Today is {name} 🎉',
      description: `Don't miss to celebrate with us!`,
    },
  },
  CURRENT_USER: {
    BIRTHDAY: {
      title: 'Today is your birthday 🎉',
      description: 'Happy birthday to you!',
    },
    ANNIVERSARY: {
      title: 'Today is your anniversary 🎉',
      description: `Happy anniversary to you!`,
    },
  },
  KLIVVR_PICK_NOMINATION: {
    title: 'Klivvr Pick Nomination',
    description: 'You have been nominated for Klivvr Pick!',
  },
  KLIVVR_PICKS: {
    title: 'Klivvr Picks',
    description: 'This week picks are posted check it out!',
  },
  LIKE: {
    title: 'New Like',
    description: `{name} liked your post`,
  },
  COMMENT: {
    title: 'New Comment',
    description: `{name} commented on your post`,
  },
};

export const getEventNotificationPayload = (args: {
  name: string;
  isCurrentUser: boolean;
  eventType: 'BIRTHDAY' | 'ANNIVERSARY';
}) => {
  return {
    title: config[args.isCurrentUser ? 'CURRENT_USER' : 'OTHER_USERS'][
      args.eventType
    ].title.replace('{name}', args.name),
    description: config[args.isCurrentUser ? 'CURRENT_USER' : 'OTHER_USERS'][
      args.eventType
    ].description.replace('{name}', args.name),
  };
};

export const getKlivvrPickNominationPayload = () => {
  return {
    title: config.KLIVVR_PICK_NOMINATION.title,
    description: config.KLIVVR_PICK_NOMINATION.description,
  };
};

export const getPicksNotificationPayload = () => {
  return {
    title: config.KLIVVR_PICKS.title,
    description: config.KLIVVR_PICKS.description,
  };
};

export const getLikeNotificationPayload = (args: { name: string }) => {
  return {
    title: config.LIKE.title,
    description: config.LIKE.description.replace('{name}', args.name),
  };
};

export const getCommentNotificationPayload = (args: { name: string }) => {
  return {
    title: config.COMMENT.title,
    description: config.COMMENT.description.replace('{name}', args.name),
  };
};
