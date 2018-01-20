<?php
/**
 * Plugin Name: Gutenberg More From Widget
 * Plugin URI:
 * Description: More From widget for Gutenberg editor.
 * Version: 1.0
 * Author: Chandra Patel
 * Author URI: https://chandrapatel.in
 * License: GPL2+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: gb-more-from-widget
 *
 * @package gb-more-from-widget
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'GBMF_VERSION' ) ) {
	define( 'GBMF_VERSION', '1.0' );
}

if ( ! defined( 'GBMF_DIR' ) ) {
	define( 'GBMF_DIR', __DIR__ );
}

if ( ! defined( 'GBMF_URL' ) ) {
	define( 'GBMF_URL', WP_PLUGIN_URL . '/gb-more-from-widget' );
}

if ( ! function_exists( 'is_plugin_active' ) ) {
	include_once ABSPATH . 'wp-admin/includes/plugin.php';
}

if ( ! is_plugin_active( 'gutenberg/gutenberg.php' ) ) {

	add_action( 'admin_notices', function() {

		printf(
			'<div class="error"><p>%s</p></div>',
			esc_html__(
				'Gutenberg More From Widget plugin require Gutenberg plugin. Install or Activate Gutenberg plugin.',
				'gb-more-from-widget'
			)
		);

		deactivate_plugins( [ 'gb-more-from-widget/gb-more-from-widget.php' ] );

	} );

	return;

}

// Load Related Posts Block.
require_once GBMF_DIR . '/classes/class-more-from.php';

//EOF
