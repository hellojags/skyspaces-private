import React, { useState, useRef } from "react";
import Grid from "@material-ui/core/Grid";
import { ITEMS_PER_PAGE } from "../../../sn.constants";
import { launchSkyLink } from "../../../sn.util";
import SnAppCardActionBtnGrp from "../../cards/sn.app-card-action-btn-grp";
import { makeStyles } from "@material-ui/core/styles";
import { setLoaderDisplay } from "../../../reducers/actions/sn.loader.action";
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import ImageGallery from "react-image-gallery";
import clsx from "clsx";
import Card from "@material-ui/core/Card";
import Link from "@material-ui/core/Link";
import { fetchSkyspaceAppCount } from "../../../reducers/actions/sn.skyspace-app-count.action";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import cliTruncate from "cli-truncate";
import SnAddToSkyspaceModal from "../../modals/sn.add-to-skyspace.modal";
import { skylinkToUrl } from "../../../sn.util";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";
import {  DOWNLOAD } from "../../../sn.constants";
import {
  bsGetSkyspaceNamesforSkhubId,
  bsAddSkylinkFromSkyspaceList,
  bsRemoveFromSkySpaceList,
  bsRemoveSkylinkFromSkyspaceList,
  bsAddToHistory
} from "../../../blockstack/blockstack-api";
import { useSelector, useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
  },
  media: {
    height: 0,
    // paddingTop: "56.25%", // 16:9
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  avatar: {
    backgroundColor: red[500],
  },
  cardHeader: {
    paddingTop: 5,
    paddingBottom: 5
  }
}));

export default function SnImagesDefault(props) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [carousalStartIndex, setCarousalStartIndex] = useState(0);
  const [showCarousal, setShowCarousal] = useState(false);
  const [showAddToSkyspace, setShowAddToSkyspace] = useState(false);
  const [availableSkyspaces, setAvailableSkyspaces] = useState([]);
  const [currentApp, setCurrentApp] = useState();

  const carousalEle = useRef(null);

  const stUserSession = useSelector((state) => state.userSession);
  const stSnSkyspaceList = useSelector((state) => state.snSkyspaceList);

  const download = (app) => {
    dispatch(setLoaderDisplay(true));
    bsAddToHistory(stUserSession, {
      skylink: app.skylink,
      fileName: app.name,
      action: DOWNLOAD,
      contentLength: "",
      contentType: "",
      skhubId: app.skhubId,
      skyspaces: [],
      savedToSkySpaces: false,
    }).then(() => {
      dispatch(setLoaderDisplay(false));
      launchSkyLink(app.skylink, stUserSession);
    });
  };

  const getCarousalImages = () => {
    const images = [];
    props.filteredApps.map((app) => {
      images.push({
        thumbnail: skylinkToUrl(app.thumbnail),
        original: skylinkToUrl(app.skylink),
      });
    });
    return images;
  };

  const launchCarousal = (app, index) => {
    setShowCarousal(true);
    setCarousalStartIndex(index + (props.page - 1) * ITEMS_PER_PAGE);
    carousalEle.current.fullScreen();
  };

  const handleSkyspaceAdd = (app) => {
    const skhubId = app.skhubId;
    bsGetSkyspaceNamesforSkhubId(stUserSession, skhubId)
      .then((skyspacesForApp) => {
        console.log("skyspacesForApp ", skyspacesForApp);
        if (skyspacesForApp == null) {
          skyspacesForApp = [];
        } else {
          skyspacesForApp = skyspacesForApp.skyspaceForSkhubIdList;
        }
        return stSnSkyspaceList.filter(
          (skyspace) => !skyspacesForApp.includes(skyspace)
        );
      })
      .then((availableSkyspaces) => {
        console.log("availableSkyspaces", availableSkyspaces);
        if (availableSkyspaces != null && availableSkyspaces.length > 0) {
          console.log("will show add to skyspace modal");
          setCurrentApp(app);
          setShowAddToSkyspace(true);
          setAvailableSkyspaces(availableSkyspaces);
        } else {
          console.log("NO new skyspace available");
        }
      });
  };

  const saveAddToSkyspaceChanges = (skyspaceList) => {
    const app = currentApp;
    if (skyspaceList != null && skyspaceList.lenghth !== 0) {
      dispatch(setLoaderDisplay(true));
      bsAddSkylinkFromSkyspaceList(
        stUserSession,
        app.skhubId,
        skyspaceList
      ).then(() => {
        dispatch(setLoaderDisplay(false));
        setShowAddToSkyspace(false);
        setCurrentApp();
        dispatch(fetchSkyspaceAppCount());
      });
    }
  };

  const removeFromSkyspace = (app) => {
    const skhubId = app.skhubId;
    dispatch(setLoaderDisplay(true));
    if (typeof props.skyspace != "undefined" && props.skyspace) {
      bsRemoveFromSkySpaceList(stUserSession, props.skyspace, skhubId).then(
        (res) => {
          dispatch(fetchSkyspaceAppCount());
          dispatch(setLoaderDisplay(false));
          props.onDelete();
        }
      );
    } else {
      bsRemoveSkylinkFromSkyspaceList(
        stUserSession,
        skhubId,
        app.skyspaceList
      ).then((res) => {
        dispatch(setLoaderDisplay(false));
        props.onDelete();
      });
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <div
              className={clsx({
                "d-none": !showCarousal,
              })}
            >
              <ImageGallery
                ref={carousalEle}
                items={getCarousalImages()}
                startIndex={carousalStartIndex}
                onScreenChange={(evt) => !evt && setShowCarousal(false)}
              />
            </div>
          </Grid>
          {props.filteredApps &&
            props.filteredApps
              .slice(
                (props.page - 1) * props.itemsPerPage,
                (props.page - 1) * props.itemsPerPage + props.itemsPerPage
              )
              .map((app, i) => {
                return (
                  <>
                    <Grid item sm={4} xs={12} key={i}>
                      <Card className={classes.root}>
                        <CardHeader
                          className={classes.cardHeader}
                          title={
                            <div>
                              <div>
                                <Link
                                  variant="inherit"
                                  className="font-weight-bold cursor-pointer h5"
                                  color="black"
                                  onClick={() => {
                                    download(app);
                                  }}
                                >
                                  {cliTruncate(app.name, 25)}
                                </Link>
                                {props.isSelect && (
                            <>
                            {props.arrSelectedAps.indexOf(app)===-1 && (
                              <RadioButtonUncheckedIcon className="selection-radio"
                              onClick={()=>props.onSelection(app)}/>
                              )}
                            {props.arrSelectedAps.indexOf(app)>-1 && (
                            <RadioButtonCheckedIcon className="selection-radio"
                            onClick={()=>props.onSelection(app, true)}/>
                            )}
                            </>
                          )}
                              </div>
                              {/* <span className="display-5">
                                Create Time:{" "}
                                {moment(app.createTS).format(
                                  "MM/DD/YYYY h:mm a"
                                )}
                              </span> */}
                            </div>
                          }
                        />
                        <CardMedia
                          component="img"
                          onLoad={() => console.log("image loaded")}
                          height="100"
                          className={(classes.media, "cursor-pointer card-media")}
                          src={skylinkToUrl(app.thumbnail)}
                          onClick={() => launchCarousal(app, i)}
                          title={app.name}
                        />
                        <CardContent
                          style={{
                            paddingBottom: 0,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            component="p"
                          >
                            {cliTruncate(app.description, 40)}
                          </Typography>
                        </CardContent>
                        <CardActions disableSpacing
                          className="vertical-padding-0">
                          <SnAppCardActionBtnGrp
                            app={app}
                            hash={props.hash}
                            source="img"
                            hideTags={true}
                            hideDelete={props.senderId!=null}
                            hideAdd={props.senderId!=null}
                            onAdd={() => handleSkyspaceAdd(app)}
                            onEdit={() => props.openSkyApp(app)}
                            onDelete={() => removeFromSkyspace(app)}
                            onDownload={() => download(app)}
                          />
                        </CardActions>
                      </Card>
                    </Grid>
                  </>
                );
              })}
        </Grid>
      </Grid>
      <SnAddToSkyspaceModal
        userSession={stUserSession}
        open={showAddToSkyspace}
        availableSkyspaces={availableSkyspaces}
        onClose={() => setShowAddToSkyspace(false)}
        onSave={saveAddToSkyspaceChanges}
      />
    </>
  );
}
