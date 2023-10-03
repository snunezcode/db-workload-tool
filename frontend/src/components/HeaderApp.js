import TopNavigation from '@cloudscape-design/components/top-navigation';
import { Authenticator } from "@aws-amplify/ui-react";
import { configuration } from '../pages/Configs';

export default function App() {

    const handleClickMenu = ({detail}) => {
        
            switch (detail.id) {
              
              case 'opt1':
                    break;
              
              case 'opt2':
                    break;
              
              
            }

    };


    const i18nStrings = {
      searchIconAriaLabel: 'Search',
      searchDismissIconAriaLabel: 'Close search',
      overflowMenuTriggerText: 'More',
      overflowMenuTitleText: 'All',
      overflowMenuBackIconAriaLabel: 'Back',
      overflowMenuDismissIconAriaLabel: 'Close menu',
    };

    const profileActions = [
      { type: 'button', id: 'profile', text: 'AppVersion : ' + configuration["apps-settings"]["release"]},
      {
        type: 'menu-dropdown',
        id: 'preferences',
        text: 'Preferences',
        items: [
          { type: 'button', id: 'Settings', text: 'Settings' }
        ]
      },
      {
        type: 'menu-dropdown',
        id: 'support-group',
        text: 'Support',
        items: [
          {id: 'documentation',text: 'Documentation'},
          { id: 'feedback', text: 'Feedback' },
          { id: 'support', text: 'Customer support' },
        ],
      }
    ];
    
    
   
  return (
    
    
    <Authenticator >
          {({ signOut, user }) => (
            
            <TopNavigation
              i18nStrings={i18nStrings}
              identity={{
                href: '#',
                title:  configuration['apps-settings']['application-title'] 
              }}
              
              utilities={[
                {
                  type: 'button',
                  iconName: 'notification',
                  ariaLabel: 'Notifications',
                  badge: true,
                  disableUtilityCollapse: true,
                },
                { type: 'button', iconName: 'settings', title: 'Settings', ariaLabel: 'Settings' },
                {
                  type: 'menu-dropdown',
                  text:  user.signInUserSession.idToken.payload.email /*"myuser@example.com"*/,
                  iconName: 'user-profile',
                  items: profileActions,
                  onItemClick : handleClickMenu
                },
                {
                  type: 'button',
                  text: 'Sign out',
                  onClick : signOut,
                  variant : "primary-button"
                },
              ]}
            />
        
        
          )}
          
    </Authenticator>

  );
}



    
                                                