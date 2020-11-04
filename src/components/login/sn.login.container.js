import { bindActionCreators } from "redux";
import { setMobileMenuDisplay,
        toggleMobileMenuDisplay 
        } from "../../reducers/actions/sn.mobile-menu.action";
import { fetchSkyspaceList } from "../../reducers/actions/sn.skyspace-list.action";
import { toggleDesktopMenuDisplay } from "../../reducers/actions/sn.desktop-menu.action";
import {setUserSession } from "../../reducers/actions/sn.user-session.action";
import { fetchBlockstackPerson,
    logoutPerson,setPerson,
    setPersonGetOtherData } from "../../reducers/actions/sn.person.action";
    
export function matchDispatcherToProps(dispatcher){
    return bindActionCreators({ 
        setMobileMenuDisplay,
        toggleMobileMenuDisplay,
        setUserSession,
        setPerson,
        setPersonGetOtherData
    }, dispatcher);
}

export function mapStateToProps(state) {
    return { 
        showMobileMenu: state.snShowMobileMenu,
        showDesktopMenu: state.snShowDesktopMenu,
        userSession: state.userSession,
        person: state.person
    };
}  
