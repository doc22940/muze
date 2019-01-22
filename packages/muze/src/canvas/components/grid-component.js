import { selectElement, getEvent } from 'muze-utils';
import MuzeComponent from './muze-chart-component';
import MatrixComponent from './matrix-component';
import { ROW_MATRIX_INDEX, COLUMN_MATRIX_INDEX } from '../../../../layout/src/enums/constants';

const applyScrollAction = (elem, classPrefix, movement, type) => {
    selectElement(elem)
                    .selectAll(`.${classPrefix}-grid`)
                    .property(type, movement);
};

const scrollActionApplier = (movement, context) => {
    const classPrefix = context.params.config.classPrefix;

    return {
        horizontal: () => {
            [0, 1, 2].forEach(e =>
                applyScrollAction(`#${context.component[e][1].renderAt()}`, classPrefix, movement, 'scrollLeft'));
        },
        vertical: () => {
            [0, 1, 2].forEach(e =>
                applyScrollAction(`#${context.component[1][e].renderAt()}`, classPrefix, movement, 'scrollTop'));
        }
    };
};

export default class GridComponent extends MuzeComponent {

    constructor (params) {
        super(params.name, params.config.dimensions, 0);
        this.gridComponents = [];
        this.setParams(params);
    }

    sanitizeGrid () {
        let height = 0;
        let width = 0;
        const { viewMatricesInfo, layoutDimensions } = this.component.viewInfo();
        const scrollInfo = this.component.scrollInfo();

        for (let i = 0; i < 3; i++) {
            if (!(this.gridComponents.length && this.gridComponents[i] instanceof Array)) {
                this.gridComponents[i] = [];
            }
            for (let j = 0; j < 3; j++) {
                const matrixDim = { height: layoutDimensions.viewHeight[i], width: layoutDimensions.viewWidth[j] };
                const matrix = viewMatricesInfo.matrices[`${ROW_MATRIX_INDEX[i]}`][j];
                const matrixName = `${ROW_MATRIX_INDEX[i]}-${COLUMN_MATRIX_INDEX[j]}`;
                const matrixConfig = {
                    dimensions: matrixDim,
                    border: layoutDimensions.border,
                    classPrefix: this.params.config.classPrefix,
                    scrollInfo,
                    row: ROW_MATRIX_INDEX[i],
                    column: j
                };
                if (this.gridComponents[i][j] instanceof MuzeComponent) {
                    this.gridComponents[i][j].updateWrapper({
                        name: matrixName,
                        component: matrix,
                        config: matrixConfig
                    });
                } else {
                    const matrixWrapper = new MatrixComponent({
                        name: matrixName,
                        component: matrix,
                        config: matrixConfig
                    });
                    this.gridComponents[i].push(matrixWrapper);
                }
                if (i === 0) {
                    width += matrixDim.width;
                }
                if (j === 0) {
                    height += matrixDim.height;
                }
            }
        }
        this.boundBox({ height, width });

        this.component = this.gridComponents;
        this.allComponents = this.gridComponents;
    }

    scrollBarManager (...manager) {
        if (manager.length) {
            this._scrollBarManager = manager[0];
            return this;
        }
        return this._scrollBarManager;
    }

    attachScrollListener () {
        selectElement(`#${this.component[1][1].renderAt()}`)
                        .on('wheel', () => {
                            const event = getEvent();
                            const {
                                wheelDeltaX,
                                wheelDeltaY
                            } = event;

                            // Prevent default behaviour and stop propagating
                            event.preventDefault();
                            event.stopPropagation();

                            // Scrolling horizontally
                            if (wheelDeltaX !== 0 && Math.abs(wheelDeltaX) > Math.abs(wheelDeltaY)) {
                                this.scrollBarManager().triggerScrollBarAction('horizontal', wheelDeltaX);
                            }

                            // Scrolling Vertically
                            if (wheelDeltaY !== 0 && Math.abs(wheelDeltaX) < Math.abs(wheelDeltaY)) {
                                this.scrollBarManager().triggerScrollBarAction('vertical', wheelDeltaY);
                            }
                        });
        return this;
    }

    performScrollAction (direction, movedView) {
        scrollActionApplier(movedView, this)[direction]();
        return this;
    }

    getBoundBox () {
        const { top, left } = this.component[0][0].boundBox();
        const { height, width } = this.boundBox();

        return {
            top,
            left,
            height,
            width
        };
    }

    updateWrapper (params) {
        this.name(params.name);
        this.boundBox(params.config.dimensions);
        this.setParams(params);
        return this;
    }

    setParams (params) {
        this.component = params.component;
        this.params = params;
        this.target(params.config.target);
        this.className(params.config.className);
        this.sanitizeGrid();
        return this;
    }
}
