#!/bin/sh
# -----------------------------------------------------------------------------
# Run script for run DSNVal batch mode validator
# -----------------------------------------------------------------------------

# Cd to script folder
ORIGINAL_DIR=`pwd`
DSNVAL_DIR=`dirname "$0"`
cd $DSNVAL_DIR


# Discover the java executable to run
# If $DSNVAL_JAVA is empty, default to java
if [ -z "$DSNVAL_JAVA" ]; then
  DSNVAL_JAVA=java
fi


# Configure parameter
# Find Dsn-Val launcher
LAUNCHER=$(find $DSNVAL_DIR/plugins -name "org.eclipse.equinox.launcher_*.jar" | sort | tail -1);

# Appli name
APPLICATION=fr.cnav.autocontrole.headless.validate

# Get java properties in .ini file
UPDATE_PROP=$(cat Autocontrol-Validateur.ini | grep "fr.cnav.autocontrole.updatesite.loc");
USED_NORM=$(cat Autocontrol-Validateur.ini | grep "fr.cnav.autocontrole.defaultnorm.id");
# Not used - This 2 options is mapped in command options
#THRESHOLD_PROP=$(cat Autocontrol-Validateur.ini | grep "fr.cnav.norme.report.mutualisation.threshold");
#MAX_PROP=$(cat Autocontrol-Validateur.ini | grep "maximal.number.errors");
ROOT_PATH_PROP=$(cat Autocontrol-Validateur.ini | grep "convertedFiles.root.path");
ORIG_VAL_PROP=$(cat Autocontrol-Validateur.ini | grep "fr.cnav.norme.val.originalValue");
STOP_ON_SYN_PROP=$(cat Autocontrol-Validateur.ini | grep "stop.on.syntactic.error");
STOP_ON_CONV_PROP=$(cat Autocontrol-Validateur.ini | grep "stop.on.conversion.error");
ANOMALIES_INHIBITING=$(cat Autocontrol-Validateur.ini | grep "fr.cnav.norme.val.anomaliesInhibiting");

# Init default Log file
LOG4J_PROP="-Dlog4j.configuration=log4j.properties";

# Launch validation
eval $DSNVAL_JAVA $UPDATE_PROP $ANOMALIES_INHIBITING $ROOT_PATH_PROP $ORIG_VAL_PROP $STOP_ON_SYN_PROP $STOP_ON_CONV_PROP $LOG4J_PROP $USED_NORM -jar $LAUNCHER -application $APPLICATION $@

# Keep result
RESULT=$?

cd "$ORIGINAL_DIR"

exit $RESULT
