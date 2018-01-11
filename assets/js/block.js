const { __ } = wp.i18n;
const { registerBlockType, Editable, BlockControls, InspectorControls, BlockDescription, source: { children } } = wp.blocks;
const { Placeholder, Toolbar, Spinner } = wp.components;
const { decodeEntities } = wp.utils;
const { Component } = wp.element;
const { TextControl, SelectControl, ToggleControl, RangeControl } = wp.blocks.InspectorControls;

import classnames from 'classnames';

const MIN_POSTS = 2;
const MAX_POSTS = 6;
const MAX_POSTS_COLUMNS = 3;


/**
 * Returns a Promise with the categories or an error on failure.
 *
 * @returns Returns a Promise with the categories.
 */
export function getCategories() {

	const categoriesCollection = new wp.api.collections.Categories();

	return categoriesCollection.fetch();

}

/**
 * Returns a Promise with the posts or an error on failure.
 *
 * @param   {Number} postsToShow Number of posts to display.
 *
 * @returns Returns a Promise with the posts.
 */
export function getPosts( filter ) {

	const postsCollection = new wp.api.collections.Posts();
	
		const posts = postsCollection.fetch( {
			data: filter,
		} );
	
		return posts;

}


registerBlockType( 'gb/more-from-widget', {

	title: __( 'More From' ),

	icon: 'list-view',

	category: 'widgets',

	keywords: [ __( 'more from' ) ],

	attributes: {

		title: {
			type: 'string',
			default: __( 'More From' ),
		},
		category: {
			type: 'string',
			default: '',
		},
		postsToShow: {
			type: 'number',
			default: 3,
		},
		displayPostDate: {
			type: 'boolean',
			default: false,
		},
		displayPostThumbnail: {
			type: 'boolean',
			default: false,
		},
		layout: {
			type: 'string',
			default: 'list',
		},
		columns: {
			type: 'number',
			default: 3,
		},

	},

	edit: class extends Component {

		constructor() {

			super( ...arguments );

			const { postsToShow, category } = this.props.attributes;

			this.state = {
				categories: [],
				morePosts: []
			};

			this.categoriesRequest = getCategories();

			this.categoriesRequest.then( categories => this.setState( { categories } ) );
			
			if ( category ) {
				this.moreFromRequest = getPosts( {
					'per_page': postsToShow,
					'categories': category,
				} );

				this.moreFromRequest.then( morePosts => this.setState( { morePosts } ) );
			}
			
			this.getPosts = this.getPosts.bind( this );

			this.changePostsToShow = this.changePostsToShow.bind( this );

			this.toggleDisplayPostDate = this.toggleDisplayPostDate.bind( this );

			this.toggleDisplayPostThumbnail = this.toggleDisplayPostThumbnail.bind( this );

		}

		toggleDisplayPostDate() {
			const { displayPostDate } = this.props.attributes;
			const { setAttributes } = this.props;

			setAttributes( { displayPostDate: ! displayPostDate } );
		}

		toggleDisplayPostThumbnail() {
			const { displayPostThumbnail } = this.props.attributes;
			const { setAttributes } = this.props;

			setAttributes( { displayPostThumbnail: ! displayPostThumbnail } );
		}

		componentWillReceiveProps( nextProps ) {
			const { postsToShow: postToShowCurrent } = this.props.attributes;
			const { postsToShow: postToShowNext } = nextProps.attributes;
			const { category } = nextProps.attributes;
			const { setAttributes } = this.props;

			if ( postToShowCurrent === postToShowNext ) {
				return;
			}

			if ( postToShowNext >= MIN_POSTS && postToShowNext <= MAX_POSTS ) {
				this.moreFromRequest = getPosts( {
					'per_page': postToShowNext,
					'categories': category,
				} );

				this.moreFromRequest
					.then( morePosts => this.setState( { morePosts } ) );

				setAttributes( { postsToShow: postToShowNext } );
			}
		}

		changePostsToShow( postsToShow ) {
			const { setAttributes } = this.props;
			setAttributes( { postsToShow: parseInt( postsToShow, 10 ) || 0 } );
		}

		getPosts( selectedCategory ) {

			const { category, postsToShow } = this.props.attributes;
			const { setAttributes } = this.props;

			this.moreFromRequest = getPosts( {
				'per_page': postsToShow,
				'categories': selectedCategory,
			} );
			
			this.moreFromRequest.then( morePosts => this.setState( { morePosts } ) );

			setAttributes( { category: selectedCategory } );

		}

		render() {
			const { categories, morePosts } = this.state;

			const hasPosts = Array.isArray( morePosts ) && morePosts.length;

			const { setAttributes } = this.props;

			if ( ! categories.length ) {
				return (
					<Placeholder
						icon="admin-post"
						label={ __( 'Initializing Block' ) }
					>
						<Spinner />
					</Placeholder>
				);
			}

			// Removing posts from display should be instant.
			const postsDifference = morePosts.length - this.props.attributes.postsToShow;
			if ( postsDifference > 0 ) {
				morePosts.splice( this.props.attributes.postsToShow, postsDifference );
			}

			const { focus } = this.props;
			const { title, category, displayPostDate, displayPostThumbnail, layout, columns } = this.props.attributes;
			const layoutControls = [
				{
					icon: 'list-view',
					title: __( 'List View' ),
					onClick: () => setAttributes( { layout: 'list' } ),
					isActive: layout === 'list',
				},
				{
					icon: 'grid-view',
					title: __( 'Grid View' ),
					onClick: () => setAttributes( { layout: 'grid' } ),
					isActive: layout === 'grid',
				},
			];

			const inspectorControls = focus && (
				<InspectorControls key="inspector">
					<BlockDescription>
						<p>{ __( 'Shows a list of posts.' ) }</p>
					</BlockDescription>
					<h3>{ __( 'More From Settings' ) }</h3>
					<TextControl
						label={ __( 'Title' ) }
						type="text"
						value={ title }
						onChange={ ( value ) => setAttributes( { title: value } ) }
					/>
					<SelectControl
						label={ __( 'Select Category' ) }
						value={ category }
						options={ [{value:'',label:'- Select -'}].concat( categories.map( ( category, cindex ) => ( {
							value: category.id,
							label: category.name,
						} ) ) ) }
						onChange={ ( value ) => this.getPosts( value ) }
					/>
					<ToggleControl
						label={ __( 'Display post date' ) }
						checked={ displayPostDate }
						onChange={ this.toggleDisplayPostDate }
					/>
					{ layout === 'grid' &&
					<ToggleControl
						label={ __( 'Display post thumbnail' ) }
						checked={ displayPostThumbnail }
						onChange={ this.toggleDisplayPostThumbnail }
					/>
					}
					{ layout === 'grid' &&
						<RangeControl
							label={ __( 'Columns' ) }
							value={ columns }
							onChange={ ( value ) => setAttributes( { columns: value } ) }
							min={ 2 }
							max={ MAX_POSTS_COLUMNS }
						/>
					}
					<TextControl
						label={ __( 'Number of posts to show' ) }
						type="number"
						min={ MIN_POSTS }
						max={ MAX_POSTS }
						value={ this.props.attributes.postsToShow }
						onChange={ ( value ) => this.changePostsToShow( value ) }
					/>
				</InspectorControls>
			);

			if ( ! category ) {
				return [
					inspectorControls,
					<Placeholder
						icon="admin-post"
						label={ __( 'Please select category' ) }
					>
					</Placeholder>
				];
			}

			return [
				focus && (
					<BlockControls key="controls">
						<Toolbar controls={ layoutControls } />
					</BlockControls>
				),

				inspectorControls,
				<div className={ this.props.className }>
					{ title &&
						<h3 className="more-from-title"> {title} </h3>
					}
					<ul
						className={ classnames( 'columns-' + columns, {
							'is-grid': layout === 'grid',
							'is-list': layout === 'list',
						} ) }
						key="more-from"
					>
						{ morePosts.map( ( post, i ) =>
							<li key={ i }>
								{ displayPostThumbnail && post.thumbnail &&
									<img src={ post.thumbnail } />
								}
								<a href={ post.link } target="_blank">{ decodeEntities( post.title.rendered.trim() ) || __( '(Untitled)' ) }</a>
								{ displayPostDate && post.date_gmt &&
									<time dateTime={ moment( post.date_gmt ).utc().format() } className="post-date">
										{ moment( post.date_gmt ).local().format( 'MMMM DD, Y' ) }
									</time>
								}
							</li>
						) }
					</ul>
				</div>,
			];
		}

		componentWillUnmount() {
			if ( this.moreFromRequest.state() === 'pending' ) {
				this.moreFromRequest.abort();
			}
		}

	},

	save() {
		return null;
	},

} );
