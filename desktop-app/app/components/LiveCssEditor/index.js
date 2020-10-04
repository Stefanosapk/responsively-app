import React, {useMemo, useState, useEffect} from 'react';
import {Rnd} from 'react-rnd';
import {useSelector, useDispatch} from 'react-redux';
import cx from 'classnames';
import pubsub from 'pubsub.js';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import SettingsIcon from '@material-ui/icons/Settings';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/theme-github';

import useCommonStyles from '../useCommonStyles';
import useStyles from './useStyles';
import TextAreaWithCopyButton from '../../utils/TextAreaWithCopyButton';
import Button from '@material-ui/core/Button';
import {APPLY_CSS} from '../../constants/pubsubEvents';
import {
  CSS_EDITOR_MODES,
  DEVTOOLS_MODES,
  isHorizontallyStacked,
  isVeriticallyStacked,
} from '../../constants/previewerLayouts';
import KebabMenu from '../KebabMenu';
import {Tooltip} from '@material-ui/core';
import DockRight from '../icons/DockRight';

const getResizingDirections = position => {
  switch (position) {
    case CSS_EDITOR_MODES.LEFT:
      return {right: true};
    case CSS_EDITOR_MODES.RIGHT:
      return {left: true};
    case CSS_EDITOR_MODES.TOP:
      return {bottom: true};
    case CSS_EDITOR_MODES.BOTTOM:
      return {top: true};
    default:
      return true;
  }
};

const computeHeight = (position, devToolsConfig) => {
  if (position === CSS_EDITOR_MODES.UNDOCKED) {
    return null;
  }
  return isVeriticallyStacked(position)
    ? `calc(100vh - ${10 +
        headerHeight +
        statusBarHeight +
        (devToolsConfig.open && devToolsConfig.mode === DEVTOOLS_MODES.BOTTOM
          ? devToolsConfig.size.height
          : 0)}px)`
    : 300;
};

const computeWidth = (position, devToolsConfig) => {
  if (position === CSS_EDITOR_MODES.UNDOCKED) {
    return null;
  }
  return isHorizontallyStacked(position) ? 'calc(100vw - 50px)' : 400;
};

const headerHeight = 70;
const statusBarHeight = 20;

const LiveCssEditor = ({
  browser,
  isOpen,
  position,
  content,
  boundaryClass,
  devToolsConfig,
}) => {
  const classes = useStyles();
  const commonClasses = useCommonStyles();
  const [css, setCss] = useState(null);
  console.log('devToolsConfig', devToolsConfig);
  const [height, setHeight] = useState(computeHeight(position, devToolsConfig));
  const [width, setWidth] = useState(computeWidth(position, devToolsConfig));

  useEffect(() => {
    setHeight(computeHeight(position, devToolsConfig));
  }, [devToolsConfig]);

  const onApply = () => {
    if (!css) {
      return;
    }
    pubsub.publish(APPLY_CSS, [{css}]);
  };

  useEffect(onApply, [css]);

  const isUndocked = useMemo(() => position === CSS_EDITOR_MODES.UNDOCKED, [
    position,
  ]);
  const enableResizing = useMemo(() => getResizingDirections(position), [
    position,
  ]);
  const disableDragging = useMemo(() => !isUndocked, [isUndocked]);

  return (
    <div className={classes.wrapper} style={{height, width}}>
      <Rnd
        dragHandleClassName={classes.titleBar}
        disableDragging={disableDragging}
        enableResizing={enableResizing}
        style={{zIndex: 100}}
        default={{
          width: isUndocked ? 400 : '100%',
          height: isUndocked ? 300 : '100%',
          x: isUndocked ? 100 : 0,
          y: isUndocked ? 100 : 0,
        }}
        bounds={`.${boundaryClass}`}
        onResize={(e, dir, ref) => {
          if (isUndocked) {
            return;
          }
          const {width: _width, height: _height} = ref.getBoundingClientRect();
          if (width !== _width) {
            setWidth(_width);
          }
          if (height !== _height) {
            setHeight(_height);
          }
        }}
      >
        <div className={classes.container}>
          <div
            className={cx(
              classes.titleBar,
              commonClasses.flexContainerSpaceBetween,
              {
                [classes.dragHandle]: !disableDragging,
              }
            )}
          >
            Live CSS Editor{' '}
            <KebabMenu>
              <div onClick={() => {}}>Un-dock Editor</div>
            </KebabMenu>
          </div>
          <div className={classes.mainContent}>
            <AceEditor
              className={classes.editor}
              placeholder="Enter CSS to apply"
              mode="css"
              theme="twilight"
              name="css"
              onChange={setCss}
              fontSize={14}
              showPrintMargin={true}
              showGutter={true}
              highlightActiveLine={true}
              value={css}
              width="100%"
              height="100%"
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: false,
                showLineNumbers: true,
                tabSize: 2,
              }}
            />
            <Button
              size="small"
              color="primary"
              variant="contained"
              onClick={onApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </Rnd>
    </div>
  );
};
export default LiveCssEditor;
