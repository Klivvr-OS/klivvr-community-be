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
};

export const getNotificationPayload = (args: {
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
