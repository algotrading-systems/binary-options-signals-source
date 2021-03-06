var SignalsTable = React.createClass({

    /**
     * This function returns seconds count before next signals arriving.
     */
    getElapsedTime: function(maxSignalTime) {
        // Birth time of recent signal in milliseconds
        maxSignalTime = maxSignalTime || 0;
        // Walk through all signals to calc max signal time
        if (maxSignalTime == 0){
            for (var i = 0; i < this.state.signals.length; i++) {
                maxSignalTime = Math.max(this.state.signals[i].tsMs, maxSignalTime);
            }
        }
        // Time when new signal will arrived.
        var signalsArrivingTime = maxSignalTime + this.state.interval;
        var elapsedTime = signalsArrivingTime - new Date();
        return Math.max(0, elapsedTime);
    },

    getInitialState: function() {
        return {
            elapsed: 0
            , signals: this.props.signals
            , interval: this.props.interval
        };
    },

    componentDidMount: function(){
        this.timer = setInterval(this.tick, 37);
    },

    componentWillUnmount: function(){
        clearInterval(this.timer);
    },

    tick: function(){
        this.setState({elapsed: this.getElapsedTime()});
    },

    addSignal: function (signal) {
        var signals = this.props.signals;
        signals.unshift(signal);
        signals.sort(function (a, b) {
            if (a.id < b.id) {
                return 1;
            } else if (a.id > b.id) {
                return -1;
            }
            return 0;
        });
        this.setState({signals: signals});
    },

    render: function() {
        var lifeTime = 60 * 1000;
        var elapsedString = (this.state.elapsed / 1000).toFixed(0) + ' seconds';
        var signals = this.props.signals;
        var that = this;

        var nextUpdateInClasses = ['table-view-cell', 'nextUpdateIn'];
        if (this.state.elapsed < 1) {
            nextUpdateInClasses.push('expired');
        }
        if (this.state.elapsed < lifeTime * 0.25) {
            nextUpdateInClasses.push('soon');
        }
        var nextUpdateInClass = nextUpdateInClasses.join(' ');

        return (
            <ul className="table-view" id="signals-table">
                <li className={nextUpdateInClass}>
                    <p>Next update in <b>{elapsedString}</b></p>
                </li>
                <li className="table-view-cell">
                    <ul className="signal header">
                        <li className="symbol">Symbol</li>
                        <li className="direction">Option</li>
                        <li className="time">Time</li>
                        <li className="reliability">Reliability</li>
                    </ul>
                </li>
                <li className="table-view-divider"></li>
            { signals.map(function(signal){
                var directionClassName = 'direction direction-' + signal.direction.toString().toLowerCase();
                var reliabilityClassName = 'reliability reliability-' + signal.reliability;
                var lifeTimePercent = that.getElapsedTime(signal.tsMs) / lifeTime * 100;
                var className = 'table-view-cell table-view-cell-signal ';
                className += (lifeTimePercent > 0) ? 'active ' : 'expired ';
                return <li key={signal.key} className={className}>
                    <ul className="signal">
                        <li className="symbol">{signal.symbol}</li>
                        <li className={directionClassName}>{signal.direction}</li>
                        <li className="time">{signal.time}</li>
                        <li className={reliabilityClassName}>&nbsp;</li>
                    </ul>
                    <div className="signalMeta">
                        <div className="signalId">
                            #{signal.id}
                        </div>
                        <div className="signalLifeTimeContainer">
                            <div className="signalLifeTime">
                                <div className="signalLifeTimeBar" style={{width: lifeTimePercent + '%'}}></div>
                            </div>
                        </div>
                    </div>
                </li>;
            }) }
            </ul>
        );
    }
});